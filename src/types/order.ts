import type { OrderCustomer, ShippingAddress } from './account'

export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'canceled'

export type OrderItem = {
  kind: 'product' | 'kit'
  product_id: number | null
  name: string
  quantity: number
  unit_price: number
  total: number
  kit: { box: string; box_name: string; slugs: string[]; names: string[]; message: string | null; full_price: number } | null
}

export type OrderView = {
  id: number
  code: string
  status: OrderStatus
  payment_method: 'pix' | 'card'
  payment_status: string | null
  payment_detail: string | null
  pix_qr_code: string | null
  pix_qr_base64: string | null
  pix_ticket_url: string | null
  pix_expires_at: string | null
  installments: number | null
  subtotal: number
  discount: number
  shipping: number
  total: number
  shipping_zone: { id: string; name: string; days_min: number; days_max: number } | null
  shipping_address: ShippingAddress
  customer: OrderCustomer
  tracking_code: string | null
  paid_at: string | null
  shipped_at: string | null
  created_at: string
  items: OrderItem[]
}

export type AdminOrderRow = {
  id: number; code: string; status: OrderStatus; total: number; created_at: string
  payment_method: 'pix' | 'card'; customer: { name: string; email: string }; shipping_address: { city: string; state: string }
  order_items: { quantity: number }[]
}

// Como vêm do banco: numeric do Postgres chega como texto
type Numeric = number | string
export type OrderItemRow = Omit<OrderItem, 'unit_price' | 'total'> & { unit_price: Numeric; total: Numeric }
export type OrderRow = Omit<OrderView, 'subtotal' | 'discount' | 'shipping' | 'total' | 'items'> & { subtotal: Numeric; discount: Numeric; shipping: Numeric; total: Numeric }
