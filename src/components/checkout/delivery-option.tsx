import { formatBRL } from '@/data/products'
import type { Quote } from '@/types/shipping'

type DeliveryOptionProps = { hasAddress: boolean; quote: Quote | null; quoting: boolean }

export function DeliveryOption({ hasAddress, quote, quoting }: DeliveryOptionProps) {
  if (!hasAddress) return <p className="text-sm text-muted-foreground">Escolha um endereço para calcular o frete.</p>
  if (quote?.zone) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-foreground p-4">
        <div>
          <p className="font-semibold">Entrega padrão · {quote.zone.name}</p>
          <p className="text-sm text-muted-foreground">
            Chega em {quote.zone.days_min} a {quote.zone.days_max} dias úteis depois do pagamento
          </p>
        </div>
        <p className="shrink-0 font-display text-lg font-extrabold">
          {quote.shipping === 0 ? <span className="text-success">Grátis</span> : formatBRL(quote.shipping)}
        </p>
      </div>
    )
  }
  return quoting ? <div className="h-16 animate-pulse rounded-2xl bg-secondary" /> : null
}
