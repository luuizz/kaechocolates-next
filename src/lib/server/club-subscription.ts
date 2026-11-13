import 'server-only'
import { after } from 'next/server'
import { brand } from '@/config/brand'
import { fail, ok } from '@/lib/result'
import type { SubscribeInput, SubscriptionActionInput } from '@/lib/validation/club'
import type { Profile } from '@/types/account'
import { applyPreapproval, openSubscription, type SubscriptionRow } from './club'
import { db, dbMessage } from './db'
import { notifySubscription } from './email'
import { createPreapproval, MpError, payerEmailFor, preapprovalSnapshot, setPreapprovalStatus } from './mercadopago'

type StartedSubscription = {
  id: string
  amount: string
  plan: { name: string }
  period: { label: string; months: number }
}

export async function startSubscription(user: Profile, input: SubscribeInput) {
  const { plan, period, addressId, cpf, card, notes } = input
  let sub: StartedSubscription
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
    // Recusas de regra (estoque, CPF, endereço) são esperadas; só registra falha
    if ((error as { code?: string })?.code !== 'P0001') console.error('[clube] start_subscription', error)
    return fail(dbMessage(error, 'Não foi possível criar a assinatura.'))
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
    if (saved.status === 'canceled') return fail('O cartão não foi autorizado. Tente outro cartão.')
    after(() => notifySubscription(saved.id))
    return ok({ id: String(saved.id), status: String(saved.status) })
  } catch (error) {
    await applyPreapproval(sub.id, { status: 'failed' }).catch(() => {})
    const details = error instanceof MpError ? JSON.stringify(error.details ?? '') : ''
    if (/card|token|cvv|security_code/i.test(details))
      return fail('O cartão não foi autorizado. Confira os dados ou use outro cartão.')
    return fail(error instanceof MpError ? error.message : 'Não foi possível falar com o Mercado Pago. Tente de novo.')
  }
}

const MP_STATUS = { pause: 'paused', resume: 'authorized', cancel: 'cancelled' } as const

export async function changeSubscription(user: Profile, { action, id }: SubscriptionActionInput) {
  const isAdmin = user.role === 'admin'
  const sub: SubscriptionRow | null =
    isAdmin && id
      ? ((await db().query("select * from public.subscriptions where id = $1 and status <> 'canceled'", [id]))
          .rows[0] ?? null)
      : await openSubscription(user.id)
  if (!sub) return fail('Assinatura não encontrada.')

  if (action !== 'cancel' && sub.period.months !== 1 && !isAdmin)
    return fail('Pausar está disponível só no plano mensal. Nos outros, você pode cancelar a renovação.')
  if (action === 'pause' && sub.status !== 'active') return fail('Só dá para pausar uma assinatura ativa.')
  if (action === 'resume' && sub.status !== 'paused') return fail('A assinatura não está pausada.')

  try {
    if (!sub.mp_preapproval_id) await applyPreapproval(sub.id, { status: 'cancelled' })
    else
      await applyPreapproval(
        sub.id,
        preapprovalSnapshot(await setPreapprovalStatus(sub.mp_preapproval_id, MP_STATUS[action])),
      )
    return ok(undefined)
  } catch (error) {
    console.error('[clube] gerenciar', error)
    return fail(error instanceof MpError ? error.message : 'Não foi possível atualizar a assinatura.')
  }
}
