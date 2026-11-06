import { brand } from '@/config/brand'
import { validCpf } from '@/lib/cpf'
import { userFromRequest } from '@/lib/server/auth'
import { applyPreapproval } from '@/lib/server/club'
import { db, dbMessage } from '@/lib/server/db'
import { createPreapproval, MpError, payerEmailFor, preapprovalSnapshot } from '@/lib/server/mercadopago'

const json = (status: number, body: unknown) => Response.json(body, { status })
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

// Assina o clube: o banco calcula o valor e cria a assinatura; o Mercado Pago
// autoriza o cartão e passa a cobrar a cada período.
export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return json(401, { error: 'Entre na sua conta para assinar.' })

  const body = await request.json().catch(() => null)
  const plan = String(body?.plan ?? '')
  const period = String(body?.period ?? '')
  const addressId = Number(body?.addressId)
  const cpf = String(body?.cpf ?? '').replace(/\D/g, '')
  const token = body?.card?.token
  if (!ID.test(plan) || !ID.test(period)) return json(400, { error: 'Escolha o plano e o período.' })
  if (!Number.isInteger(addressId) || addressId <= 0) return json(400, { error: 'Escolha o endereço de entrega das caixas.' })
  if (!validCpf(cpf)) return json(400, { error: 'Informe um CPF válido.' })
  if (typeof token !== 'string' || !token) return json(400, { error: 'Preencha os dados do cartão.' })

  let sub: { id: string; amount: string; plan: { name: string }; period: { label: string; months: number } }
  try {
    const { rows } = await db().query('select * from public.start_subscription($1, $2, $3, $4, $5, $6)', [user.id, plan, period, addressId, cpf, String(body?.notes ?? '')])
    sub = rows[0]
  } catch (error) {
    console.error('[clube] start_subscription', error)
    return json(409, { error: dbMessage(error, 'Não foi possível criar a assinatura.') })
  }

  try {
    const pre = await createPreapproval({
      reference: `KAE-CLUBE-${sub.id}`,
      reason: `Clube ${brand.shortName}: ${sub.plan.name} (${sub.period.label.toLowerCase()})`,
      amount: Number(sub.amount),
      months: sub.period.months,
      payerEmail: payerEmailFor(user.email ?? ''),
      cardToken: token,
      backUrl: `${brand.url}/conta?aba=clube`,
    })
    const saved = await applyPreapproval(sub.id, preapprovalSnapshot(pre))
    if (saved.status === 'canceled') return json(402, { error: 'O cartão não foi autorizado. Tente outro cartão.' })
    return json(201, { subscription: { id: saved.id, status: saved.status } })
  } catch (error) {
    await applyPreapproval(sub.id, { status: 'failed' }).catch(() => {})
    const details = error instanceof MpError ? JSON.stringify(error.details ?? '') : ''
    const message = /card|token|cvv|security_code/i.test(details)
      ? 'O cartão não foi autorizado. Confira os dados ou use outro cartão.'
      : error instanceof MpError ? error.message : 'Não foi possível falar com o Mercado Pago. Tente de novo.'
    return json(502, { error: message })
  }
}
