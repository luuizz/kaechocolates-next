import Link from 'next/link'
import { LockSimple, Package, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import type { CartItem } from '@/components/cart/cart-provider'
import { BarPackage } from '@/components/product/bar-package'
import { brand } from '@/config/brand'
import { formatBRL, installment } from '@/data/products'
import { cn } from '@/lib/utils'
import type { Quote } from '@/types/shipping'

type OrderSummaryProps = { items: CartItem[]; quote: Quote | null; quoting: boolean; problems: string[] }

// Resumo lateral do checkout com os valores calculados pelo servidor
export function OrderSummary({ items, quote, quoting, problems }: OrderSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-36 lg:self-start">
      <div className="rounded-[1.75rem] bg-secondary p-6">
        <h2 className="font-display text-2xl font-extrabold">Resumo</h2>
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              {item.kind === 'product' ? (
                <span className="w-11 shrink-0 overflow-hidden rounded-lg" style={{ background: item.product.tile }}><BarPackage product={item.product} /></span>
              ) : (
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-foreground text-background"><Package size={20} weight="duotone" /></span>
              )}
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.title}</span><span className="text-muted-foreground">{item.quantity} × {formatBRL(item.unitPrice)}</span></span>
              <span className="font-semibold tabular-nums">{formatBRL(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        {problems.length > 0 && (
          <div role="alert" className="mt-5 flex flex-col gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {problems.map((problem) => <p key={problem} className="flex gap-2"><WarningCircle size={18} className="shrink-0" /> {problem}</p>)}
            <Link href="/carrinho" className="font-semibold underline">Ajustar a sacola</Link>
          </div>
        )}
        <dl className={cn('mt-5 flex flex-col gap-2 border-t pt-5 text-sm transition-opacity', quoting && 'opacity-50')}>
          <SummaryRow label="Produtos" value={quote ? formatBRL(quote.subtotal) : '…'} />
          {quote && quote.discount > 0 && <SummaryRow label="Desconto dos kits" value={`-${formatBRL(quote.discount)}`} className="text-success" />}
          <SummaryRow label="Frete" value={!quote?.zone ? 'Escolha o endereço' : quote.shipping === 0 ? 'Grátis' : formatBRL(quote.shipping)} />
          <div className="mt-2 flex items-baseline justify-between border-t pt-3">
            <dt className="font-bold">Total</dt>
            <dd className="font-display text-3xl font-extrabold tabular-nums">{quote ? formatBRL(quote.total) : '…'}</dd>
          </div>
          {quote && <p className="text-right text-xs text-muted-foreground">ou até {brand.commerce.maxInstallments}x de {installment(quote.total, brand.commerce.maxInstallments)} no cartão</p>}
        </dl>
        {quote && quote.zone && quote.shipping > 0 && (
          <p className="mt-4 rounded-xl bg-background p-3 text-xs">Faltam <strong>{formatBRL(quote.free_from - (quote.subtotal - quote.discount))}</strong> para o frete grátis.</p>
        )}
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockSimple size={14} /> Pagamento processado pelo Mercado Pago</p>
    </aside>
  )
}

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
