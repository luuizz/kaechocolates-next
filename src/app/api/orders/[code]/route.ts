import { after } from 'next/server'
import { userFromRequest } from '@/lib/server/auth'
import { notifyOrder } from '@/lib/server/email'
import { loadOrder, publicOrder, syncWithMercadoPago } from '@/lib/server/orders'

// Pedido do cliente logado. Enquanto o pagamento estiver pendente, confere o
// status direto no Mercado Pago (funciona mesmo sem o webhook configurado).
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: 'Entre na sua conta.' }, { status: 401 })

  const { code } = await params
  let order = await loadOrder(code).catch(() => null)
  if (!order || (order.user_id !== user.id && user.role !== 'admin'))
    return Response.json({ error: 'Pedido não encontrado.' }, { status: 404 })

  if (order.status === 'pending_payment' && order.mp_order_id) {
    await syncWithMercadoPago(code, order.mp_order_id).catch((error) => console.error('[pedido] sync', error))
    order = (await loadOrder(code)) ?? order
    if (order.status !== 'pending_payment') after(() => notifyOrder(code))
  }
  return Response.json({ order: publicOrder(order) })
}
