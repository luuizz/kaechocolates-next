'use client'

import Link from 'next/link'
import { LockSimple, ShoppingBagOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { brand } from '@/config/brand'
import { formatBRL, installment } from '@/data/products'
import { useCart } from './cart-provider'
import { CartLine } from './cart-line'
import { FreeShipping } from './free-shipping'

export function CartPage() {
  const { items, count, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 py-28 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-secondary"><ShoppingBagOpen size={44} weight="duotone" /></span>
        <h1 className="font-display text-4xl font-extrabold">Sua sacola está vazia</h1>
        <p className="text-muted-foreground">Escolha seus sabores de Brasil e volte aqui para finalizar.</p>
        <Button asChild size="lg"><Link href="/produtos">Ver chocolates</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
      <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em]">Sacola <span className="text-muted-foreground">({count})</span></h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <ul className="divide-y border-y">{items.map((item) => <CartLine key={item.id} item={item} />)}</ul>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-36 lg:self-start">
          <FreeShipping subtotal={subtotal} />
          <div className="rounded-2xl border p-6">
            <h2 className="font-display text-xl font-bold">Resumo</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatBRL(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{subtotal >= brand.commerce.freeShippingFrom ? 'Grátis' : 'Calculado no checkout'}</dd></div>
              <div className="mt-2 flex items-baseline justify-between border-t pt-4"><dt className="font-bold">Total</dt><dd className="font-display text-2xl font-extrabold">{formatBRL(subtotal)}</dd></div>
            </dl>
            <p className="mt-1 text-right text-xs text-muted-foreground">ou {brand.commerce.maxInstallments}x de {installment(subtotal)} sem juros</p>
            <Button size="lg" className="mt-6 w-full" disabled title="O checkout chega com a integração do Mercado Pago">
              <LockSimple weight="bold" /> Finalizar compra
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Checkout com Pix e cartão chega na próxima etapa.</p>
          </div>
          <Button asChild variant="ghost"><Link href="/produtos">Continuar comprando</Link></Button>
        </aside>
      </div>
    </div>
  )
}
