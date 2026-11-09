import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { brand } from '@/config/brand'
import { db, dbMessage } from '@/lib/server/db'
import { userFromRequest } from '@/lib/server/auth'
import { parseCart } from '@/lib/server/cart-input'
import { createMpOrder, MpError, paymentSnapshot, type MpOrder } from '@/lib/server/mercadopago'
import { applyPayment, loadOrder, publicOrder, recordCharge } from '@/lib/server/orders'
import { paymentProblem } from '@/lib/orders'
import { validCpf } from '@/lib/cpf'
import { notifyOrder } from '@/lib/server/email'

const json = (status: number, body: unknown) => Response.json(body, { status })

// Fecha a compra:
// 1. confere quem está comprando (token do Neon Auth)
// 2. o banco cria o pedido com os preços dele e reserva o estoque (place_order)
// 3. cobra no Mercado Pago (Pix ou cartão) e grava o resultado (apply_payment)
export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return json(401, { error: 'Entre na sua conta para finalizar a compra.' })

  const body = await request.json().catch(() => null)
  const items = parseCart(body?.items)
  const addressId = Number(body?.addressId)
  const method = body?.method === 'card' ? 'card' : body?.method === 'pix' ? 'pix' : null
  const cpf = String(body?.cpf ?? '').replace(/\D/g, '')
  if (!items) return json(400, { error: 'Sacola inválida.' })
  if (!Number.isInteger(addressId) || addressId <= 0) return json(400, { error: 'Escolha um endereço de entrega.' })
  if (!method) return json(400, { error: 'Escolha a forma de pagamento.' })
  if (!validCpf(cpf)) return json(400, { error: 'Informe um CPF válido.' })

  const card = body?.card
  if (method === 'card' && (typeof card?.token !== 'string' || typeof card?.paymentMethodId !== 'string')) {
    return json(400, { error: 'Preencha os dados do cartão.' })
  }

  let code: string
  let total: number
  try {
    const { rows } = await db().query('select code, total from public.place_order($1, $2::jsonb, $3, $4, $5, $6)', [user.id, JSON.stringify(items), addressId, method, cpf, brand.commerce.freeShippingFrom])
    code = rows[0].code
    total = Number(rows[0].total)
  } catch (error) {
    // Recusas de regra (estoque, CPF, endereço…) são esperadas; só registra o que é falha
    if ((error as { code?: string })?.code !== 'P0001') console.error('[checkout] place_order', error)
    return json(409, { error: dbMessage(error, 'Não foi possível criar o pedido.') })
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
      payer: { email: user.email ?? '', firstName: testMode && method === 'pix' ? 'APRO' : firstName, lastName: rest.join(' ') || undefined, cpf },
      method: method === 'pix'
        ? { kind: 'pix' }
        : { kind: 'card', token: card.token, paymentMethodId: card.paymentMethodId, paymentTypeId: card.paymentTypeId === 'debit_card' ? 'debit_card' : 'credit_card', installments: Math.min(Math.max(Number(card.installments) || 1, 1), brand.commerce.maxInstallments) },
    })
  } catch (error) {
    // Cobrança não saiu: cancela o pedido e devolve o estoque
    await applyPayment(code, { status: 'failed', status_detail: 'mp_error' }).catch((cancelError) => console.error('[checkout] cancelar pedido', code, cancelError))
    const message = error instanceof MpError ? error.message : 'Não foi possível falar com o Mercado Pago. Tente de novo.'
    return json(502, { error: message })
  }

  // A cobrança já existe no Mercado Pago: daqui em diante o pedido nunca é cancelado por falha nossa
  if (!(await recordCharge(code, paymentSnapshot(mpOrder)))) {
    return json(202, { code })
  }

  const order = publicOrder(await loadOrder(code).catch(() => null))
  // E-mail de pedido recebido (Pix) ou pagamento aprovado (cartão), depois da resposta
  after(() => notifyOrder(code))
  if (order?.status === 'canceled') return json(402, { error: paymentProblem(order.payment_detail), code })
  return json(201, { order, code })
}
