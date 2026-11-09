import { userFromRequest } from '@/lib/server/auth'
import { applyPreapproval, openSubscription, syncSubscription } from '@/lib/server/club'
import { db } from '@/lib/server/db'
import { subscriptionActionSchema } from '@/lib/validation/club'
import { MpError, setPreapprovalStatus, preapprovalSnapshot } from '@/lib/server/mercadopago'

const json = (status: number, body: unknown) => Response.json(body, { status })

// GET: confere a assinatura em andamento no Mercado Pago (enquanto estiver pendente)
export async function GET(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return json(401, { error: 'Entre na sua conta.' })
  const sub = await openSubscription(user.id)
  if (sub?.status === 'pending') await syncSubscription(sub).catch((error) => console.error('[clube] sync', error))
  return json(200, { ok: true })
}

// POST { action: pause | resume | cancel, id? }: o assinante gerencia a própria
// assinatura; o admin pode passar o id de qualquer uma.
export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return json(401, { error: 'Entre na sua conta.' })
  const input = subscriptionActionSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return json(400, { error: 'Ação inválida.' })
  const { action, id } = input.data

  const sub = user.role === 'admin' && id
    ? ((await db().query("select * from public.subscriptions where id = $1 and status <> 'canceled'", [id])).rows[0] ?? null)
    : await openSubscription(user.id)
  if (!sub) return json(404, { error: 'Assinatura não encontrada.' })

  if (action !== 'cancel' && sub.period.months !== 1 && user.role !== 'admin') {
    return json(400, { error: 'Pausar está disponível só no plano mensal. Nos outros, você pode cancelar a renovação.' })
  }
  if (action === 'pause' && sub.status !== 'active') return json(400, { error: 'Só dá para pausar uma assinatura ativa.' })
  if (action === 'resume' && sub.status !== 'paused') return json(400, { error: 'A assinatura não está pausada.' })

  try {
    if (!sub.mp_preapproval_id) {
      await applyPreapproval(sub.id, { status: 'cancelled' })
    } else {
      const pre = await setPreapprovalStatus(sub.mp_preapproval_id, action === 'pause' ? 'paused' : action === 'resume' ? 'authorized' : 'cancelled')
      await applyPreapproval(sub.id, preapprovalSnapshot(pre))
    }
    return json(200, { ok: true })
  } catch (error) {
    console.error('[clube] gerenciar', error)
    return json(502, { error: error instanceof MpError ? error.message : 'Não foi possível atualizar a assinatura.' })
  }
}
