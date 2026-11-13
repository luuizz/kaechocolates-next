import 'server-only'
import { after } from 'next/server'
import type { Profile } from '@/types/account'
import { db } from './db'
import { notifyOrder } from './email'
import { getMpOrder, paymentSnapshot } from './mercadopago'
import { normalizeOrder } from '@/lib/orders'
import type { OrderView } from '@/types/order'

export async function loadOrder(
  code: string,
): Promise<(OrderView & { user_id: string; mp_order_id: string | null }) | null> {
  const { rows } = await db().query('select * from public.orders where code = $1', [code])
  if (!rows[0]) return null
  const items = await db().query(
    'select kind, product_id, name, quantity, unit_price, total, kit from public.order_items where order_id = $1 order by id',
    [rows[0].id],
  )
  return { ...normalizeOrder(rows[0], items.rows), user_id: rows[0].user_id, mp_order_id: rows[0].mp_order_id }
}

type PaymentSnapshot = ReturnType<typeof paymentSnapshot> | { status: string; status_detail: string }

export async function applyPayment(code: string, snapshot: PaymentSnapshot) {
  await db().query('select public.apply_payment($1, $2::jsonb)', [code, JSON.stringify(snapshot)])
}

// Se o banco falhar duas vezes, o pedido fica pendente e o webhook acerta o status
export async function recordCharge(code: string, snapshot: PaymentSnapshot) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await applyPayment(code, snapshot)
      return true
    } catch (error) {
      console.error(`[checkout] apply_payment (tentativa ${attempt})`, code, error)
    }
  }
  return false
}

export async function syncWithMercadoPago(code: string, mpOrderId: string) {
  const mpOrder = await getMpOrder(mpOrderId)
  if (mpOrder.external_reference !== code) throw new Error('Pedido do Mercado Pago não confere.')
  await applyPayment(code, paymentSnapshot(mpOrder))
}

export function publicOrder(order: Awaited<ReturnType<typeof loadOrder>>) {
  if (!order) return null
  const { user_id: _user, mp_order_id: _mp, ...rest } = order
  void _user
  void _mp
  return rest
}

export async function orderForUser(user: Profile, code: string) {
  let order = await loadOrder(code).catch(() => null)
  if (!order || (order.user_id !== user.id && user.role !== 'admin')) return null

  if (order.status === 'pending_payment' && order.mp_order_id) {
    await syncWithMercadoPago(code, order.mp_order_id).catch((error) => console.error('[pedido] sync', error))
    order = (await loadOrder(code)) ?? order
    if (order.status !== 'pending_payment') after(() => notifyOrder(code))
  }
  return publicOrder(order)
}
