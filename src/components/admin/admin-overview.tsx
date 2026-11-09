'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Barcode, CurrencyCircleDollar, Package, Users, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { StatusBadge } from '@/components/orders/order-parts'
import { formatBRL } from '@/data/products'
import { listBoxes, listCustomers, listOrders, listPlans, listProducts } from '@/lib/admin-api'
import { AdminHeader, Panel } from './admin-shell'
import type { AdminOrderRow } from '@/types/order'
import type { AdminProduct } from '@/types/product'

type Stats = { products: AdminProduct[]; boxes: number; plans: number; customers: number; orders: AdminOrderRow[]; loadedAt: number }

export function AdminOverview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listProducts(), listBoxes(), listPlans(), listCustomers(), listOrders()])
      .then(([products, boxes, plans, customers, orders]) => setStats({
        products,
        orders,
        loadedAt: Date.now(),
        boxes: boxes.filter((box) => box.active).length,
        plans: plans.filter((plan) => plan.active).length,
        customers: customers.length,
      }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar.'))
  }, [])

  const active = stats?.products.filter((product) => product.active) ?? []
  const soldOut = active.filter((product) => product.soldOut)
  const noPhoto = active.filter((product) => !product.image)

  const PAID = ['paid', 'preparing', 'shipped', 'delivered']
  const since = (stats?.loadedAt ?? 0) - 30 * 24 * 60 * 60 * 1000
  const toShip = stats?.orders.filter((order) => order.status === 'paid' || order.status === 'preparing') ?? []
  const paid30 = stats?.orders.filter((order) => PAID.includes(order.status) && new Date(order.created_at).getTime() >= since) ?? []
  const revenue = paid30.reduce((total, order) => total + order.total, 0)

  const cards = [
    { href: '/admin/produtos', label: 'Barras à venda', value: stats ? active.length - soldOut.length : null, note: stats ? `${soldOut.length} esgotada(s) · ${stats.products.length - active.length} oculta(s)` : '', icon: Barcode, color: 'bg-flavor-yellow' },
    { href: '/admin/pedidos', label: 'Pedidos para enviar', value: stats ? toShip.length : null, note: stats ? `${stats.orders.filter((order) => order.status === 'pending_payment').length} aguardando pagamento` : '', icon: Package, color: 'bg-[#a9d8ef]' },
    { href: '/admin/pedidos', label: 'Vendas em 30 dias', value: stats ? formatBRL(revenue) : null, note: stats ? `${paid30.length} pedido(s) pagos` : '', icon: CurrencyCircleDollar, color: 'bg-flavor-pink' },
    { href: '/admin/clientes', label: 'Contas criadas', value: stats?.customers ?? null, note: 'clientes e equipe', icon: Users, color: 'bg-[#5fc2b0]' },
  ]

  return (
    <>
      <AdminHeader title={`Olá, ${(profile?.full_name || 'admin').split(' ')[0]}`} description="Resumo da loja. Mudanças salvas aqui aparecem no site na hora." />
      {error && <p role="alert" className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ href, label, value, note, icon: Icon, color }) => (
          <Link key={href} href={href} className="group rounded-[1.5rem] bg-background p-5 transition-shadow hover:shadow-lg">
            <span className={`grid size-11 place-items-center rounded-full ${color}`}><Icon size={22} weight="duotone" /></span>
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            {value === null ? <span className="mt-1 block h-9 w-14 animate-pulse rounded-lg bg-secondary" /> : <p className="font-display text-4xl font-extrabold tracking-tight tabular-nums">{value}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl font-bold">Pendências do catálogo</h2>
          {!stats ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-secondary" />
          ) : noPhoto.length === 0 && soldOut.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Tudo em dia: todas as barras ativas têm foto e estoque.</p>
          ) : (
            <ul className="mt-3 divide-y">
              {soldOut.map((product) => (
                <li key={`s${product.id}`}><Link href={`/admin/produtos/${product.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:underline"><span className="flex items-center gap-2"><WarningCircle size={18} className="text-destructive" /> {product.name} {product.cacao}% está esgotada</span><ArrowRight size={16} /></Link></li>
              ))}
              {noPhoto.length > 0 && (
                <li className="py-3 text-sm">
                  <p className="flex items-center gap-2"><WarningCircle size={18} className="text-flavor-orange" /> {noPhoto.length} {noPhoto.length === 1 ? 'barra usa' : 'barras usam'} a embalagem desenhada (sem foto)</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                    {noPhoto.map((product) => <Link key={product.id} href={`/admin/produtos/${product.id}`} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-foreground hover:text-background">{product.name} {product.cacao}%</Link>)}
                  </div>
                </li>
              )}
            </ul>
          )}
        </Panel>
        <Panel className="self-start bg-foreground text-background">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm font-semibold text-background/75 hover:text-background">Ver todos</Link>
          </div>
          {!stats ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-background/10" />
          ) : stats.orders.length === 0 ? (
            <p className="mt-3 text-sm text-background/70">Nenhum pedido ainda. Eles aparecem aqui assim que alguém finalizar uma compra.</p>
          ) : (
            <ul className="mt-3 divide-y divide-background/10">
              {stats.orders.slice(0, 6).map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/pedidos/${order.code}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:underline">
                    <span><strong>{order.code}</strong> <span className="text-background/60">· {order.customer.name.split(' ')[0]}</span></span>
                    <span className="flex items-center gap-2"><StatusBadge status={order.status} /> <span className="tabular-nums">{formatBRL(order.total)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
