import { Truck } from '@phosphor-icons/react/dist/ssr'
import { brand } from '@/config/brand'
import { formatBRL } from '@/data/products'

// Barra de progresso até o frete grátis
export function FreeShipping({ subtotal }: { subtotal: number }) {
  const goal = brand.commerce.freeShippingFrom
  const missing = Math.max(0, goal - subtotal)
  const percent = Math.min(100, (subtotal / goal) * 100)
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <p className="flex items-center gap-2 text-sm">
        <Truck size={20} weight="duotone" className="shrink-0" />
        {missing > 0 ? <span>Faltam <strong>{formatBRL(missing)}</strong> para o frete grátis</span> : <strong>Você ganhou frete grátis!</strong>}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label="Progresso até o frete grátis">
        <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
