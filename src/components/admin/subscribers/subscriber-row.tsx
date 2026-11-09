import { Pause, Play, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/data/products'
import { formatDate } from '@/lib/club'
import { cn } from '@/lib/utils'
import type { SubscriptionAction } from './use-subscribers'
import type { Subscription } from '@/types/club'
import { SUBSCRIPTION_STATUS } from '@/constants/club'

function nextCharge(sub: Subscription) {
  if (sub.status === 'canceled') return sub.ends_at ? `caixas até ${formatDate(sub.ends_at)}` : '—'
  if (sub.status === 'paused' || !sub.next_payment_date) return '—'
  return formatDate(sub.next_payment_date)
}

type SubscriberRowProps = { sub: Subscription; onAction: (action: SubscriptionAction) => void }

export function SubscriberRow({ sub, onAction }: SubscriberRowProps) {
  const status = SUBSCRIPTION_STATUS[sub.status]
  const name = sub.customer.name
  return (
    <tr>
      <td className="px-5 py-3">
        <span className="block font-semibold">{name}</span>
        <span className="text-xs text-muted-foreground">
          {sub.customer.email} · {sub.shipping_address.city}/{sub.shipping_address.state}
        </span>
        {sub.notes && <span className="mt-1 block text-xs text-muted-foreground italic">“{sub.notes}”</span>}
      </td>
      <td className="px-3 py-3">
        <span className="block font-semibold">
          {sub.plan.name} · {sub.plan.bars} barras
        </span>
        <span className="text-xs text-muted-foreground">
          {sub.period.label} · {formatBRL(sub.amount)}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', status.tone)}>{status.label}</span>
      </td>
      <td className="px-3 py-3 text-muted-foreground">{nextCharge(sub)}</td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-1">
          {sub.status === 'active' && (
            <Button variant="ghost" size="icon" onClick={() => onAction('pause')} aria-label={`Pausar ${name}`}>
              <Pause />
            </Button>
          )}
          {sub.status === 'paused' && (
            <Button variant="ghost" size="icon" onClick={() => onAction('resume')} aria-label={`Retomar ${name}`}>
              <Play />
            </Button>
          )}
          {sub.status !== 'canceled' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onAction('cancel')}
              aria-label={`Cancelar ${name}`}
            >
              <X />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
