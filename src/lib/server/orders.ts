import { db } from './db'
import { getMpOrder, paymentSnapshot } from './mercadopago'
import { normalizeOrder, type OrderView } from '@/lib/orders'

export async function loadOrder(code: string): Promise<(OrderView & { user_id: string; mp_order_id: string | null }) | null> {
  const { rows } = await db().query('select * from public.orders where code = $1', [code])
  if (!rows[0]) return null
  const items = await db().query('select kind, product_id, name, quantity, unit_price, total, kit from public.order_items where order_id = $1 order by id', [rows[0].id])
  return { ...normalizeOrder(rows[0], items.rows), user_id: rows[0].user_id, mp_order_id: rows[0].mp_order_id }
}

type PaymentSnapshot = ReturnType<typeof paymentSnapshot> | { status: string; status_detail: string }

export async function applyPayment(code: string, snapshot: PaymentSnapshot) {
  await db().query('select public.apply_payment($1, $2::jsonb)', [code, JSON.stringify(snapshot)])
}

// Grava a resposta de uma cobrança que já saiu no Mercado Pago. Tenta duas vezes;
// se o banco continuar falhando, o pedido fica pendente e o webhook acerta o status.
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

// Busca o status atual no Mercado Pago e grava no pedido
export async function syncWithMercadoPago(code: string, mpOrderId: string) {
  const mpOrder = await getMpOrder(mpOrderId)
  if (mpOrder.external_reference !== code) throw new Error('Pedido do Mercado Pago não confere.')
  await applyPayment(code, paymentSnapshot(mpOrder))
}

// Tira do retorno o que o cliente não precisa ver
export function publicOrder(order: Awaited<ReturnType<typeof loadOrder>>) {
  if (!order) return null
  const { user_id: _user, mp_order_id: _mp, ...rest } = order
  void _user
  void _mp
  return rest
}
