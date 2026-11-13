import 'server-only'
import { brand } from '@/config/brand'
import { db } from './db'
import {
  clubWelcome,
  orderPaid,
  orderReceived,
  orderShipped,
  type Email,
  type WelcomeSubscription,
} from './email-templates'
import { loadOrder } from './orders'

const API = `${process.env.RESEND_API_URL ?? 'https://api.resend.com'}/emails`
const FROM = process.env.EMAIL_FROM ?? `${brand.name} <pedidos@${new URL(brand.url).hostname}>`
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? brand.contact.email

type Kind = 'order_received' | 'order_paid' | 'order_shipped' | 'club_welcome'

async function send(kind: Kind, ref: string, to: string, email: Email) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return

  // Webhook e página do pedido podem chamar ao mesmo tempo: só um envia
  const { rowCount } = await db().query(
    'insert into public.email_log (kind, ref, recipient) values ($1, $2, $3) on conflict (kind, ref) do nothing',
    [kind, ref, to],
  )
  if (!rowCount) return

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `${kind}-${ref}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: REPLY_TO,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    })
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
  } catch (error) {
    await db()
      .query('delete from public.email_log where kind = $1 and ref = $2', [kind, ref])
      .catch(() => {})
    console.error('[e-mail]', kind, ref, error)
  }
}

export async function notifyOrder(code: string) {
  try {
    const order = await loadOrder(code)
    if (!order) return
    const to = order.customer.email
    if (order.status === 'pending_payment' && order.payment_method === 'pix' && order.pix_qr_code) {
      await send('order_received', code, to, orderReceived(order))
    }
    if (['paid', 'preparing', 'shipped', 'delivered'].includes(order.status)) {
      await send('order_paid', code, to, orderPaid(order))
    }
    if (['shipped', 'delivered'].includes(order.status)) {
      await send('order_shipped', code, to, orderShipped(order))
    }
  } catch (error) {
    console.error('[e-mail] pedido', code, error)
  }
}

export async function notifySubscription(id: number | string) {
  try {
    const { rows } = await db().query("select * from public.subscriptions where id = $1 and status = 'active'", [id])
    const sub = rows[0] as (WelcomeSubscription & { amount: string }) | undefined
    if (!sub) return
    await send('club_welcome', String(sub.id), sub.customer.email, clubWelcome({ ...sub, amount: Number(sub.amount) }))
  } catch (error) {
    console.error('[e-mail] clube', id, error)
  }
}
