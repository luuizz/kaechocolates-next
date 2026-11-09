import type { SubscriptionStatus } from '@/types/club'

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: string }> = {
  pending: { label: 'Confirmando cartão', tone: 'bg-flavor-yellow text-foreground' },
  active: { label: 'Ativa', tone: 'bg-success text-white' },
  paused: { label: 'Pausada', tone: 'bg-flavor-blue text-white' },
  canceled: { label: 'Cancelada', tone: 'bg-secondary text-foreground' },
}
