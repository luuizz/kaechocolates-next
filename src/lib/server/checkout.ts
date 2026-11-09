import 'server-only'
import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { brand } from '@/config/brand'
import { paymentProblem } from '@/lib/orders'
import { fail, ok } from '@/lib/result'
import type { CheckoutInput } from '@/lib/validation/checkout'
import type { CartInput } from '@/lib/validation/cart'
import type { Profile } from '@/types/account'
import type { Quote } from '@/types/shipping'
import { db, dbMessage } from './db'
import { notifyOrder } from './email'
import { createMpOrder, MpError, paymentSnapshot, type MpOrder } from './mercadopago'
import { applyPayment, loadOrder, publicOrder, recordCharge } from './orders'

// Prévia do pedido com preços, descontos e frete calculados pelo banco
export async function quoteOrder(items: CartInput[], state: string | null) {
  try {
    const { rows } = await db().query('select public.quote_order($1::jsonb, $2, $3) as quote', [
      JSON.stringify(items),
      state,
      brand.commerce.freeShippingFrom,
    ])
    const { need: _need, ...quote } = rows[0].quote
    void _need
    return ok(quote as Quote)
  } catch (error) {
    console.error('[checkout/quote]', error)
    const missingDb = error instanceof Error && error.message.includes('DATABASE_URL')
    return fail(missingDb ? (error as Error).message : 'Não foi possível calcular o pedido.')
  }
}

// Fecha a compra:
// 1. o banco cria o pedido com os preços dele e reserva o estoque (place_order)
// 2. cobra no Mercado Pago (Pix ou cartão) e grava o resultado (apply_payment)
export async function placeOrder(user: Profile, input: CheckoutInput) {
  const { items, addressId, cpf, ...payment } = input
  const { method } = payment

  let code: string
  let total: number
  try {
    const { rows } = await db().query('select code, total from public.place_order($1, $2::jsonb, $3, $4, $5, $6)', [
      user.id,
      JSON.stringify(items),
      addressId,
      method,
      cpf,
      brand.commerce.freeShippingFrom,
    ])
    code = rows[0].code
    total = Number(rows[0].total)
  } catch (error) {
    // Recusas de regra (estoque, CPF, endereço…) são esperadas; só registra o que é falha
    if ((error as { code?: string })?.code !== 'P0001') console.error('[checkout] place_order', error)
    return fail(dbMessage(error, 'Não foi possível criar o pedido.'))
  }

  // Em modo de teste, o nome "APRO" faz o Mercado Pago aprovar o Pix sozinho
  const [firstName, ...rest] = (user.full_name || 'Cliente').trim().split(/\s+/)
  const testMode = process.env.MERCADOPAGO_TEST_MODE === 'true'

  let mpOrder: MpOrder
  try {
    mpOrder = await createMpOrder({
      reference: code,
      amount: total,
      idempotencyKey: randomUUID(),
      payer: {
        email: user.email ?? '',
        firstName: testMode && method === 'pix' ? 'APRO' : (firstName ?? 'Cliente'),
        lastName: rest.join(' ') || undefined,
        cpf,
      },
      method:
        payment.method === 'pix'
          ? { kind: 'pix' }
          : {
              kind: 'card',
              ...payment.card,
              installments: Math.min(Math.max(payment.card.installments, 1), brand.commerce.maxInstallments),
            },
    })
  } catch (error) {
    // Cobrança não saiu: cancela o pedido e devolve o estoque
    await applyPayment(code, { status: 'failed', status_detail: 'mp_error' }).catch((cancelError) =>
      console.error('[checkout] cancelar pedido', code, cancelError),
    )
    return fail(error instanceof MpError ? error.message : 'Não foi possível falar com o Mercado Pago. Tente de novo.')
  }

  // A cobrança já existe no Mercado Pago: daqui em diante o pedido nunca é cancelado por falha nossa
  if (!(await recordCharge(code, paymentSnapshot(mpOrder)))) return ok({ code, order: null })

  const order = publicOrder(await loadOrder(code).catch(() => null))
  // E-mail de pedido recebido (Pix) ou pagamento aprovado (cartão), depois da resposta
  after(() => notifyOrder(code))
  if (order?.status === 'canceled') return fail(paymentProblem(order.payment_detail))
  return ok({ code, order })
}
