import { after } from 'next/server'
import { brand } from '@/config/brand'
import { notifySubscription } from '@/lib/server/email'
import { SUBSCRIBE_ERRORS, subscribeSchema } from '@/lib/validation/club'
import { parseWith } from '@/lib/validation/parse'
import { userFromRequest } from '@/lib/server/auth'
import { applyPreapproval } from '@/lib/server/club'
import { db, dbMessage } from '@/lib/server/db'
import { createPreapproval, MpError, payerEmailFor, preapprovalSnapshot } from '@/lib/server/mercadopago'

const json = (status: number, body: unknown) => Response.json(body, { status })

// Assina o clube: o banco calcula o valor e cria a assinatura; o Mercado Pago
// autoriza o cartão e passa a cobrar a cada período.
export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return json(401, { error: 'Entre na sua conta para assinar.' })

  const input = parseWith(subscribeSchema, await request.json().catch(() => null), SUBSCRIBE_ERRORS)
  if (!input.ok) return json(400, { error: input.error })
  const { plan, period, addressId, cpf, card, notes } = input.data

  let sub: { id: string; amount: string; plan: { name: string }; period: { label: string; months: number } }
  try {
    const { rows } = await db().query('select * from public.start_subscription($1, $2, $3, $4, $5, $6)', [
      user.id,
      plan,
      period,
      addressId,
      cpf,
      notes,
    ])
    sub = rows[0]
  } catch (error) {
    // Recusas de regra (estoque, CPF, endereço…) são esperadas; só registra o que é falha
    if ((error as { code?: string })?.code !== 'P0001') console.error('[clube] start_subscription', error)
    return json(409, { error: dbMessage(error, 'Não foi possível criar a assinatura.') })
  }

  try {
    const pre = await createPreapproval({
      reference: `KAE-CLUBE-${sub.id}`,
      reason: `Clube ${brand.shortName}: ${sub.plan.name} (${sub.period.label.toLowerCase()})`,
      amount: Number(sub.amount),
      months: sub.period.months,
      payerEmail: payerEmailFor(user.email ?? ''),
      cardToken: card.token,
      backUrl: `${brand.url}/conta?aba=clube`,
    })
    const saved = await applyPreapproval(sub.id, preapprovalSnapshot(pre))
    if (saved.status === 'canceled') return json(402, { error: 'O cartão não foi autorizado. Tente outro cartão.' })
    after(() => notifySubscription(saved.id))
    return json(201, { subscription: { id: saved.id, status: saved.status } })
  } catch (error) {
    await applyPreapproval(sub.id, { status: 'failed' }).catch(() => {})
    const details = error instanceof MpError ? JSON.stringify(error.details ?? '') : ''
    const message = /card|token|cvv|security_code/i.test(details)
      ? 'O cartão não foi autorizado. Confira os dados ou use outro cartão.'
      : error instanceof MpError
        ? error.message
        : 'Não foi possível falar com o Mercado Pago. Tente de novo.'
    return json(502, { error: message })
  }
}
