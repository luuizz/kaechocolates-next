'use client'

import { Minus, Plus } from '@phosphor-icons/react'
import { BarPackage } from '@/components/product/bar-package'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

type BarPickerProps = {
  available: Product[]
  countOf: (slug: string) => number
  full: boolean
  plus: (slug: string) => void
  minus: (slug: string) => void
}

export function BarPicker({ available, countOf, full, plus, minus }: BarPickerProps) {
  return (
    <>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
        <h3 className="flex items-center gap-3 font-display text-2xl font-extrabold">
          <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">2</span>{' '}
          Escolha as barras
        </h3>
        <p className="text-sm text-muted-foreground">Pode repetir o sabor que quiser.</p>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {available.map((product) => {
          const count = countOf(product.slug)
          return (
            <li
              key={product.slug}
              className={cn(
                'overflow-hidden rounded-2xl border-2 transition-colors',
                count ? 'border-foreground' : 'border-transparent',
              )}
            >
              <div className="relative" style={{ background: product.tile }}>
                <BarPackage product={product} />
                {count > 0 && (
                  <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 bg-card p-2.5">
                <span className="text-sm leading-tight font-bold">
                  {product.name} {product.cacao}%
                </span>
                <span className="flex items-center justify-between gap-1">
                  <span className="text-xs text-muted-foreground">{formatBRL(product.price)}</span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => minus(product.slug)}
                      disabled={!count}
                      aria-label={`Tirar ${product.name}`}
                      className="grid size-8 place-items-center rounded-full border disabled:opacity-30"
                    >
                      <Minus size={14} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => plus(product.slug)}
                      disabled={full}
                      aria-label={`Colocar ${product.name}`}
                      className="grid size-8 place-items-center rounded-full bg-foreground text-background disabled:opacity-30"
                    >
                      <Plus size={14} weight="bold" />
                    </button>
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
