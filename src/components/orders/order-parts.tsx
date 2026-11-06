import { MapPin, Package, Truck } from '@phosphor-icons/react'
import { formatBRL } from '@/data/products'
import { ORDER_STATUS, type OrderStatus, type OrderView } from '@/lib/orders'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', ORDER_STATUS[status].tone, className)}>{ORDER_STATUS[status].label}</span>
}

const STEPS: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered']

// Linha do tempo do pedido
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'canceled') return null
  const current = STEPS.indexOf(status)
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Andamento do pedido">
      {STEPS.map((step, index) => (
        <li key={step} className="flex flex-col gap-2">
          <span className={cn('h-1.5 rounded-full', index <= current ? 'bg-foreground' : 'bg-border')} />
          <span className={cn('text-[0.7rem] leading-tight sm:text-xs', index <= current ? 'font-semibold' : 'text-muted-foreground')} aria-current={index === current ? 'step' : undefined}>{ORDER_STATUS[step].label}</span>
        </li>
      ))}
    </ol>
  )
}

export function OrderItems({ order }: { order: OrderView }) {
  return (
    <>
      <ul className="divide-y">
        {order.items.map((item, index) => (
          <li key={index} className="flex gap-3 py-3 text-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary"><Package size={20} weight="duotone" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>
              {item.kit && <p className="text-muted-foreground">{item.kit.box_name} · {item.kit.names.join(', ')}</p>}
              {item.kit?.message && <p className="italic text-muted-foreground">Cartão: “{item.kit.message}”</p>}
              <p className="text-muted-foreground">{item.quantity} × {formatBRL(item.unit_price)}</p>
            </div>
            <span className="font-semibold tabular-nums">{formatBRL(item.total)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 flex flex-col gap-1.5 border-t pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Produtos</dt><dd>{formatBRL(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between text-success"><dt>Desconto dos kits</dt><dd>-{formatBRL(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{order.shipping === 0 ? 'Grátis' : formatBRL(order.shipping)}</dd></div>
        <div className="mt-1 flex items-baseline justify-between border-t pt-3"><dt className="font-bold">Total</dt><dd className="font-display text-2xl font-extrabold">{formatBRL(order.total)}</dd></div>
        <p className="text-right text-xs text-muted-foreground">{order.payment_method === 'pix' ? 'Pix' : `Cartão de crédito${order.installments && order.installments > 1 ? ` em ${order.installments}x` : ''}`}</p>
      </dl>
    </>
  )
}

export function OrderShipping({ order }: { order: OrderView }) {
  const a = order.shipping_address
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex gap-3">
        <MapPin size={20} weight="duotone" className="shrink-0" />
        <p>{a.recipient}<br /><span className="text-muted-foreground">{a.street}, {a.number}{a.complement ? ` · ${a.complement}` : ''}<br />{a.district} · {a.city}/{a.state} · {a.cep.replace(/^(\d{5})/, '$1-')}</span></p>
      </div>
      <div className="flex gap-3">
        <Truck size={20} weight="duotone" className="shrink-0" />
        <p>
          Entrega padrão{order.shipping_zone ? ` · ${order.shipping_zone.days_min} a ${order.shipping_zone.days_max} dias úteis` : ''}
          {order.tracking_code && <><br /><span className="text-muted-foreground">Rastreio: </span><a href={`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(order.tracking_code)}`} target="_blank" rel="noreferrer" className="font-semibold underline">{order.tracking_code}</a></>}
        </p>
      </div>
    </div>
  )
}
