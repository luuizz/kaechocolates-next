'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { ProductCard } from '@/components/product/product-card'
import { LINES, type Line } from '@/data/products'
import { useCatalog } from '@/components/catalog/catalog-provider'
import { cn } from '@/lib/utils'

const filters: Array<{ value: Line | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  ...Object.entries(LINES).map(([value, label]) => ({ value: value as Line, label })),
]

// Vitrine com filtro rápido por linha
export function CatalogSection() {
  const { products } = useCatalog()
  const [line, setLine] = useState<Line | 'todos'>('todos')
  const list = products.filter((product) => !product.soldOut && (line === 'todos' || product.line === line)).slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Nossos chocolates</h2>
          <p className="mt-2 text-muted-foreground">Bean to bar, do grão à barra, com cacau da Bahia.</p>
        </div>
        <div role="tablist" aria-label="Filtrar por linha" className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={line === filter.value}
              onClick={() => setLine(filter.value)}
              className={cn('h-10 rounded-full border px-4 text-sm font-semibold transition-colors', line === filter.value ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground')}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {list.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
      <div className="mt-12 flex justify-center">
        <Link href={line === 'todos' ? '/produtos' : `/produtos?linha=${line}`} className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground px-7 font-bold transition-colors hover:bg-foreground hover:text-background">
          Ver todos os chocolates <ArrowRight weight="bold" />
        </Link>
      </div>
    </section>
  )
}
