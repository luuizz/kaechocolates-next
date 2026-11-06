'use client'

import Link from 'next/link'
import { Package, Trash } from '@phosphor-icons/react'
import { BarPackage } from '@/components/product/bar-package'
import { formatBRL } from '@/data/products'
import { findBox } from '@/data/kits'
import { useCart, MAX_PER_ITEM, type CartItem } from './cart-provider'
import { QuantityStepper } from './quantity-stepper'

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { update, remove } = useCart()

  const thumb = item.kind === 'product' ? (
    <Link href={`/produtos/${item.product.slug}`} onClick={onNavigate} className="w-20 shrink-0 overflow-hidden rounded-xl" style={{ background: item.product.tile }}>
      <BarPackage product={item.product} />
    </Link>
  ) : (
    <div className="grid w-20 shrink-0 grid-cols-3 content-start gap-0.5 rounded-xl bg-foreground p-1.5" aria-hidden="true">
      {item.products.slice(0, 9).map((product, index) => <span key={index} className="aspect-[3/4] rounded-[3px]" style={{ background: product.label }} />)}
    </div>
  )

  return (
    <li className="flex gap-4 py-4">
      {thumb}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          {item.kind === 'product' ? (
            <Link href={`/produtos/${item.product.slug}`} onClick={onNavigate} className="font-display font-bold leading-tight hover:underline">{item.title}</Link>
          ) : (
            <p className="flex items-center gap-1.5 font-display font-bold leading-tight"><Package size={18} weight="duotone" /> {item.title}</p>
          )}
          <button type="button" onClick={() => remove(item.id)} aria-label={`Remover ${item.title}`} className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive">
            <Trash size={18} />
          </button>
        </div>
        {item.kind === 'product' ? (
          <p className="text-xs text-muted-foreground">{item.product.weight} · {formatBRL(item.unitPrice)} cada</p>
        ) : (
          <div className="text-xs text-muted-foreground">
            <p>{findBox(item.kit.box).name} · {item.products.map((product) => product.name).join(', ')}</p>
            {item.kit.message && <p className="mt-1 italic">Cartão: “{item.kit.message}”</p>}
            <p className="mt-1"><s>{formatBRL(item.fullPrice)}</s> <span className="font-semibold text-success">{formatBRL(item.unitPrice)} o kit</span></p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper size="sm" value={item.quantity} max={MAX_PER_ITEM} onChange={(value) => update(item.id, value)} label={`Quantidade de ${item.title}`} />
          <strong className="text-sm">{formatBRL(item.unitPrice * item.quantity)}</strong>
        </div>
      </div>
    </li>
  )
}
