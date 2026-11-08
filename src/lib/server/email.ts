import { brand } from '@/config/brand'
import { db } from './db'
import { clubWelcome, orderPaid, orderReceived, orderShipped, type Email, type WelcomeSubscription } from './email-templates'
import { loadOrder } from './orders'

// E-mails automáticos pelo Resend (resend.com). Sem RESEND_API_KEY, nada é enviado
// (o site funciona igual). Cada aviso sai uma vez só: a tabela email_log guarda o que foi.
// RESEND_API_URL só existe para os testes, com um servidor simulado.
const API = `${process.env.RESEND_API_URL ?? 'https://api.resend.com'}/emails`
const FROM = process.env.EMAIL_FROM ?? `${brand.name} <pedidos@${new URL(brand.url).hostname}>`
// Para onde vão as respostas do cliente. O remetente não precisa ter caixa de entrada.
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? brand.contact.email

type Kind = 'order_received' | 'order_paid' | 'order_shipped' | 'club_welcome'

async function send(kind: Kind, ref: string, to: string, email: Email) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return

  // Reserva o envio; se outra chamada já reservou (webhook e página ao mesmo tempo), para aqui
  const { rowCount } = await db().query('insert into public.email_log (kind, ref, recipient) values ($1, $2, $3) on conflict (kind, ref) do nothing', [kind, ref, to])
  if (!rowCount) return

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${kind}-${ref}` },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject: email.subject, html: email.html, text: email.text }),
    })
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
  } catch (error) {
    // Libera a reserva para tentar de novo no próximo aviso
    await db().query('delete from public.email_log where kind = $1 and ref = $2', [kind, ref]).catch(() => {})
    console.error('[e-mail]', kind, ref, error)
  }
}

// Manda os avisos que o pedido ainda não recebeu, conforme o status atual.
// Chamado depois de cada mudança de pagamento e quando o painel marca como enviado.
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
