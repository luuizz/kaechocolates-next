import type { OrderCustomer, ShippingAddress } from './account'

export type Plan = { id: string; name: string; bars: number; price: number; color: string; pitch: string; perks: string[]; featured?: boolean }

export type Period = { id: string; label: string; months: number; discount: number; note?: string }

export type AdminPlan = Plan & { active: boolean; sort_order: number }

export type AdminPeriod = Period & { active: boolean; sort_order: number }

export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'canceled'

export type Subscription = {
  id: number
  user_id: string
  plan_id: string
  period_id: string
  plan: { id: string; name: string; bars: number }
  period: { id: string; label: string; months: number }
  amount: number
  monthly: number
  status: SubscriptionStatus
  next_payment_date: string | null
  ends_at: string | null
  card_last_four: string | null
  shipping_address: ShippingAddress
  customer: OrderCustomer
  notes: string | null
  started_at: string | null
  canceled_at: string | null
  created_at: string
  subscription_payments?: { id: number; amount: number; status: string; paid_at: string | null; created_at: string }[]
}
