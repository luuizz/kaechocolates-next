'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CaretRight, Package } from '@phosphor-icons/react'
import { StatusBadge } from '@/components/orders/order-parts'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FormMessage } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { getNeon, unwrap } from '@/lib/neon'
import { formatDateTime } from '@/lib/orders'
import { TabTitle } from '../tab-title'
import type { OrderStatus } from '@/types/order'

type CustomerOrderRow = { id: number; code: string; status: OrderStatus; total: number | string; created_at: string; payment_method: 'pix' | 'card'; order_items: { quantity: number }[] }

export function OrdersTab() {
  const [orders, setOrders] = useState<CustomerOrderRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getNeon().from('orders').select('id,code,status,total,created_at,payment_method,order_items(quantity)').order('created_at', { ascending: false }).limit(50)
      .then((result: { data: unknown; error: unknown }) => setOrders(unwrap(result) as CustomerOrderRow[]))
      .catch((err: Error) => { setError(err.message); setOrders([]) })
  }, [])

  return (
    <>
      <TabTitle>Pedidos</TabTitle>
      <FormMessage>{error}</FormMessage>
      {orders === null ? (
        <div className="flex flex-col gap-3">{[0, 1].map((index) => <div key={index} className="h-24 animate-pulse rounded-tile bg-secondary" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          size="panel"
          titleAs="p"
          icon={<Package size={26} weight="duotone" />}
          title="Nenhum pedido ainda"
          description="Quando você fizer uma compra, o pedido e o rastreio aparecem aqui."
          action={<Button asChild><Link href="/produtos">Ver chocolates</Link></Button>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => <OrderLink key={order.id} order={order} />)}
        </ul>
      )}
    </>
  )
}

function OrderLink({ order }: { order: CustomerOrderRow }) {
  const count = order.order_items.reduce((total, item) => total + item.quantity, 0)
  return (
    <li>
      <Link href={`/pedido/${order.code}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-tile border p-5 transition-colors hover:border-foreground">
        <span className="min-w-32">
          <span className="block font-display text-lg font-extrabold">{order.code}</span>
          <span className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</span>
        </span>
        <StatusBadge status={order.status} />
        <span className="ml-auto text-right text-sm">
          <span className="block font-semibold">{formatBRL(Number(order.total))}</span>
          <span className="text-muted-foreground">{count} {count === 1 ? 'item' : 'itens'} · {order.payment_method === 'pix' ? 'Pix' : 'Cartão'}</span>
        </span>
        <CaretRight size={18} className="text-muted-foreground" />
      </Link>
    </li>
  )
}
