'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Barcode, CreditCard, Package, Sparkle, Users, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { listBoxes, listCustomers, listPlans, listProducts, type AdminProduct } from '@/lib/admin-api'
import { AdminHeader, Panel } from './admin-shell'

type Stats = { products: AdminProduct[]; boxes: number; plans: number; customers: number }

export function AdminOverview() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listProducts(), listBoxes(), listPlans(), listCustomers()])
      .then(([products, boxes, plans, customers]) => setStats({
        products,
        boxes: boxes.filter((box) => box.active).length,
        plans: plans.filter((plan) => plan.active).length,
        customers: customers.length,
      }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar.'))
  }, [])

  const active = stats?.products.filter((product) => product.active) ?? []
  const soldOut = active.filter((product) => product.soldOut)
  const noPhoto = active.filter((product) => !product.image)

  const cards = [
    { href: '/admin/produtos', label: 'Barras à venda', value: stats ? active.length - soldOut.length : null, note: stats ? `${soldOut.length} esgotada(s) · ${stats.products.length - active.length} oculta(s)` : '', icon: Barcode, color: 'bg-flavor-yellow' },
    { href: '/admin/kits', label: 'Caixas de kit', value: stats?.boxes ?? null, note: 'no Monte seu kit', icon: Package, color: 'bg-[#a9d8ef]' },
    { href: '/admin/clube', label: 'Planos do clube', value: stats?.plans ?? null, note: 'ativos na página do clube', icon: Sparkle, color: 'bg-flavor-pink' },
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
            {value === null ? <span className="mt-1 block h-9 w-14 animate-pulse rounded-lg bg-secondary" /> : <p className="font-display text-4xl font-extrabold tabular-nums">{value}</p>}
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
          <span className="grid size-11 place-items-center rounded-full bg-background/10"><CreditCard size={22} weight="duotone" /></span>
          <h2 className="mt-4 font-display text-xl font-bold">Pedidos e assinaturas</h2>
          <p className="mt-2 text-sm text-background/70">Entram com o checkout do Mercado Pago (Pix e cartão) e a cobrança recorrente do clube. Até lá, a sacola funciona, mas o botão de finalizar fica desligado.</p>
        </Panel>
      </div>
    </>
  )
}
