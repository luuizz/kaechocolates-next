import 'server-only'
import { db } from './db'
import { getPreapproval, preapprovalSnapshot } from './mercadopago'

export type SubscriptionRow = {
  id: string; user_id: string; status: 'pending' | 'active' | 'paused' | 'canceled'; mp_preapproval_id: string | null
  period: { months: number }
}

export async function openSubscription(userId: string) {
  const { rows } = await db().query("select * from public.subscriptions where user_id = $1 and status <> 'canceled' order by id desc limit 1", [userId])
  return (rows[0] as SubscriptionRow | undefined) ?? null
}

export async function applyPreapproval(id: string | number, data: ReturnType<typeof preapprovalSnapshot> | Record<string, unknown>) {
  const { rows } = await db().query('select * from public.apply_subscription($1, $2::jsonb)', [id, JSON.stringify(data)])
  return rows[0]
}

// Confere a assinatura no Mercado Pago e grava (usado quando o status ainda é pendente)
export async function syncSubscription(sub: SubscriptionRow) {
  if (!sub.mp_preapproval_id) return
  const pre = await getPreapproval(sub.mp_preapproval_id)
  await applyPreapproval(sub.id, preapprovalSnapshot(pre))
}
