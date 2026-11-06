'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/field'
import { StatusBadge } from '@/components/orders/order-parts'
import { formatBRL } from '@/data/products'
import { listOrders, type AdminOrderRow } from '@/lib/admin-api'
import { formatDateTime, type OrderStatus } from '@/lib/orders'
import { cn } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'

// Abas na ordem do trabalho do dia: o que precisa de ação primeiro
const FILTERS: Array<{ value: OrderStatus | 'todos' | 'abertos'; label: string }> = [
  { value: 'abertos', label: 'Para enviar' },
  { value: 'pending_payment', label: 'Aguardando pagamento' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'canceled', label: 'Cancelados' },
  { value: 'todos', label: 'Todos' },
]

export function OrderList() {
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('abertos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listOrders().then(setOrders).catch((err) => toast.error(err.message))
  }, [])

  const count = (value: (typeof FILTERS)[number]['value']) => (orders ?? []).filter((order) => matches(order, value)).length
  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (orders ?? []).filter((order) => matches(order, filter) && (!term || `${order.code} ${order.customer.name} ${order.customer.email}`.toLowerCase().includes(term)))
  }, [orders, filter, search])

  return (
    <>
      <AdminHeader title="Pedidos" description={orders ? `${orders.length} pedidos no total` : 'Carregando…'} />
      <Panel className="p-0 md:p-0">
        <div className="flex flex-col gap-3 border-b p-4 md:p-5">
          <div role="tablist" aria-label="Filtrar pedidos" className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={cn('flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors', filter === item.value ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground')}>
                {item.label} {orders && <span className={cn('rounded-full px-1.5 text-xs tabular-nums', filter === item.value ? 'bg-background/20' : 'bg-secondary')}>{count(item.value)}</span>}
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código, nome ou e-mail" aria-label="Buscar pedidos" className="h-11 pl-10" />
          </div>
        </div>
        {!orders ? (
          <div className="h-48 animate-pulse" />
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Nenhum pedido aqui.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Pedido</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Cliente</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((order) => (
                  <tr key={order.id} className="relative transition-colors hover:bg-secondary/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/pedidos/${order.code}`} className="font-semibold after:absolute after:inset-0">{order.code}</Link>
                      <span className="block text-xs text-muted-foreground">{order.order_items.reduce((total, item) => total + item.quantity, 0)} itens · {order.payment_method === 'pix' ? 'Pix' : 'Cartão'}</span>
                    </td>
                    <td className="px-3 py-3"><span className="block">{order.customer.name}</span><span className="text-xs text-muted-foreground">{order.shipping_address.city}/{order.shipping_address.state}</span></td>
                    <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatBRL(order.total)}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{formatDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

function matches(order: AdminOrderRow, filter: (typeof FILTERS)[number]['value']) {
  if (filter === 'todos') return true
  if (filter === 'abertos') return order.status === 'paid' || order.status === 'preparing'
  return order.status === filter
}

