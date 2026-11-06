import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { ProductCard } from '@/components/product/product-card'
import { SortSelect } from '@/components/catalog/sort-select'
import { Button } from '@/components/ui/button'
import { LINES, filterProducts, type Line } from '@/data/products'
import { getCatalog } from '@/lib/catalog'
import { cn } from '@/lib/utils'

type Search = { linha?: string; busca?: string; ordem?: string }

const intro: Record<Line | 'todos', string> = {
  todos: 'Bean to bar brasileiro: do grão à barra, com cacau da Bahia e ingredientes de origem.',
  intensos: 'Mais cacau, menos açúcar. Para quem quer sentir o grão.',
  'ao-leite': 'Cremosos e cheios de Brasil: cumaru, café, doce de leite.',
  brancos: 'Manteiga de cacau com açaí, milho, nibs e outras ideias boas.',
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const { linha, busca, ordem } = await searchParams
  const line = linha && linha in LINES ? (linha as Line) : null
  return {
    title: line ? `Chocolates ${LINES[line].toLowerCase()}` : 'Chocolates',
    description: line
      ? `Chocolates ${LINES[line].toLowerCase()} bean to bar da Kaê, feitos com cacau da Bahia e ingredientes brasileiros.`
      : 'Todas as barras bean to bar da Kaê: intensos, ao leite e brancos, com cacau da Bahia e ingredientes brasileiros.',
    alternates: { canonical: line ? `/produtos?linha=${line}` : '/produtos' },
    // Busca e ordenação são variações da mesma lista: o Google segue os links, mas não indexa
    robots: busca || ordem ? { index: false, follow: true } : undefined,
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { linha, busca, ordem } = await searchParams
  const line = (linha && linha in LINES ? linha : 'todos') as Line | 'todos'
  const { products } = await getCatalog()
  const list = filterProducts(products, { line: line === 'todos' ? undefined : line, search: busca, sort: ordem })
  const tabs = [{ value: 'todos', label: 'Todos' }, ...Object.entries(LINES).map(([value, label]) => ({ value, label }))]
  const count = (value: string) => (value === 'todos' ? products.length : products.filter((product) => product.line === value).length)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Início</Link> <span aria-hidden="true">/</span>{' '}
        <span className="text-foreground">{line === 'todos' ? 'Chocolates' : LINES[line]}</span>
      </nav>
      <header className="mt-4 flex flex-col gap-3">
        <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
          {busca ? <>Busca: “{busca}”</> : line === 'todos' ? 'Chocolates' : LINES[line]}
        </h1>
        <p className="max-w-xl text-muted-foreground">{intro[line]}</p>
      </header>

      <div className="sticky top-20 z-20 -mx-5 mt-8 flex flex-col gap-3 border-y bg-background/95 px-5 py-3 backdrop-blur md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8 lg:top-32">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab) => {
            const active = line === tab.value
            const href = tab.value === 'todos' ? '/produtos' : `/produtos?linha=${tab.value}`
            return (
              <Link key={tab.value} href={href} aria-current={active ? 'page' : undefined} className={cn('flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors', active ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground')}>
                {tab.label} <span className={cn('text-xs', active ? 'text-background/70' : 'text-muted-foreground')}>{count(tab.value)}</span>
              </Link>
            )
          })}
        </div>
        <Suspense><SortSelect /></Suspense>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{list.length} {list.length === 1 ? 'chocolate' : 'chocolates'}</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-secondary"><MagnifyingGlass size={34} weight="duotone" /></span>
          <h2 className="font-display text-2xl font-bold">Nenhum chocolate encontrado</h2>
          <p className="text-muted-foreground">Tente outro termo ou veja todos os sabores.</p>
          <Button asChild><Link href="/produtos">Ver todos</Link></Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {list.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      )}
    </div>
  )
}
