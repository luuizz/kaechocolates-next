'use client'

import Link from 'next/link'
import { Trash } from '@phosphor-icons/react'
import { BarPackage } from '@/components/product/bar-package'
import { formatBRL } from '@/data/products'
import { useCart, MAX_PER_ITEM, type CartItem } from './cart-provider'
import { QuantityStepper } from './quantity-stepper'

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { update, remove } = useCart()
  const { product, quantity } = item
  return (
    <li className="flex gap-4 py-4">
      <Link href={`/produtos/${product.slug}`} onClick={onNavigate} className="w-20 shrink-0 overflow-hidden rounded-xl" style={{ background: product.tile }}>
        <BarPackage product={product} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/produtos/${product.slug}`} onClick={onNavigate} className="font-display font-bold leading-tight hover:underline">
            {product.name} {product.cacao}%
          </Link>
          <button type="button" onClick={() => remove(product.slug)} aria-label={`Remover ${product.name}`} className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive">
            <Trash size={18} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{product.weight} · {formatBRL(product.price)} cada</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper size="sm" value={quantity} max={MAX_PER_ITEM} onChange={(value) => update(product.slug, value)} label={`Quantidade de ${product.name}`} />
          <strong className="text-sm">{formatBRL(product.price * quantity)}</strong>
        </div>
      </div>
    </li>
  )
}
