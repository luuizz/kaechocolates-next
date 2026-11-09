// Rótulos e normalização das assinaturas do clube (conta e painel)
import type { Subscription, SubscriptionStatus } from '@/types/club'

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: string }> = {
  pending: { label: 'Confirmando cartão', tone: 'bg-flavor-yellow text-foreground' },
  active: { label: 'Ativa', tone: 'bg-success text-white' },
  paused: { label: 'Pausada', tone: 'bg-flavor-blue text-white' },
  canceled: { label: 'Cancelada', tone: 'bg-secondary text-foreground' },
}

export const normalizeSubscription = (row: Subscription): Subscription => ({
  ...row,
  amount: Number(row.amount),
  monthly: Number(row.monthly),
  subscription_payments: row.subscription_payments?.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
})

// Recebe caixa neste mês? Ativa, ou cancelada mas com período pago até depois de hoje
export const receivesBox = (sub: Pick<Subscription, 'status' | 'ends_at'>, now: number) =>
  sub.status === 'active' ||
  (sub.status === 'canceled' && Boolean(sub.ends_at) && new Date(sub.ends_at!).getTime() > now)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
