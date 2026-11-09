// Normalização e regras das assinaturas do clube (conta e painel)
import type { Subscription } from '@/types/club'

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
