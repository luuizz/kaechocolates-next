// Tipos e rótulos das assinaturas do clube (conta e painel)
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'canceled'

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: string }> = {
  pending: { label: 'Confirmando cartão', tone: 'bg-flavor-yellow text-foreground' },
  active: { label: 'Ativa', tone: 'bg-success text-white' },
  paused: { label: 'Pausada', tone: 'bg-flavor-blue text-white' },
  canceled: { label: 'Cancelada', tone: 'bg-secondary text-foreground' },
}

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
  shipping_address: { recipient: string; cep: string; street: string; number: string; complement: string | null; district: string; city: string; state: string }
  customer: { name: string; email: string; phone: string | null; cpf: string }
  notes: string | null
  started_at: string | null
  canceled_at: string | null
  created_at: string
  subscription_payments?: { id: number; amount: number; status: string; paid_at: string | null; created_at: string }[]
}

export const normalizeSubscription = (row: Subscription): Subscription => ({
  ...row,
  amount: Number(row.amount),
  monthly: Number(row.monthly),
  subscription_payments: row.subscription_payments?.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
})

// Recebe caixa neste mês? Ativa, ou cancelada mas com período pago até depois de hoje
export const receivesBox = (sub: Pick<Subscription, 'status' | 'ends_at'>, now: number) =>
  sub.status === 'active' || (sub.status === 'canceled' && Boolean(sub.ends_at) && new Date(sub.ends_at!).getTime() > now)

export const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(value))
