import Link from 'next/link'
import { ArrowUpRight, Medal, Package, Sparkle } from '@phosphor-icons/react/dist/ssr'
import { BarPackage } from '@/components/product/bar-package'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

// Mosaico do topo (mesma ideia do site atual), com preço e compra no bloco
function ProductTile({ product, className, priority }: { product?: Product; className?: string; priority?: boolean }) {
  if (!product) return null
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={cn('group relative block overflow-hidden rounded-2xl', className)}
      style={{ background: product.tile }}
    >
      <BarPackage product={product} priority={priority} className="mx-auto h-full max-h-full transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105" />
      <div className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-between gap-2 rounded-xl bg-background/95 px-3 py-2 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="min-w-0 truncate text-xs font-bold">{product.name} {product.cacao}%</span>
        <span className="shrink-0 text-xs font-semibold">{product.soldOut ? 'Esgotado' : formatBRL(product.price)}</span>
      </div>
    </Link>
  )
}

// Os 14 primeiros do catálogo (ordem definida no painel) preenchem o mosaico
export function Bento({ products }: { products: Product[] }) {
  const list = products.slice(0, 14)
  const [a, b, c, d, e, f, g, h, i, j, k, l, m, n] = list
  // Barras decorativas dos blocos do clube e do kit (as que têm foto primeiro)
  const pool = [...products.filter((product) => product.image), ...products.filter((product) => !product.image && !product.soldOut)]
  const deco = (...indexes: number[]) => (pool.length ? indexes.flatMap((index) => pool[index % pool.length] ?? []) : [])

  return (
    <section aria-label="Destaques" className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-8">
      <div className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4 md:gap-4 lg:auto-rows-[14.5rem] xl:grid-cols-5">
        {/* Clube */}
        <Link href="/clube" className="group relative col-span-2 overflow-hidden rounded-2xl bg-mint p-5 sm:p-6 md:p-8">
          <Sparkle size={140} weight="fill" className="absolute -right-6 -top-6 text-white/20 transition-transform duration-700 group-hover:rotate-90" />
          <span className="relative hidden items-center gap-1.5 rounded-full bg-foreground px-3 py-1 sm:inline-flex text-2xs font-bold uppercase tracking-wider text-background">Novidade todo mês</span>
          <h2 className="relative max-w-[58%] font-display text-[1.75rem] sm:mt-4 sm:text-4xl font-extrabold leading-display tracking-display text-white lg:text-5xl">Clube de assinaturas</h2>
          <span className="absolute bottom-5 left-5 inline-flex sm:bottom-6 sm:left-6 items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold md:bottom-8 md:left-8">
            Conhecer planos <ArrowUpRight weight="bold" className="transition-transform group-hover:rotate-45" />
          </span>
          <div className="absolute -bottom-6 -right-2 flex w-[42%] max-w-56 -rotate-6 transition-transform duration-500 group-hover:-rotate-2">
            {pool.length > 1 && deco(4, 6).map((product, index) => (
              <BarPackage key={`${product.slug}-${index}`} product={product} className={index === 0 ? 'w-1/2 translate-x-4' : 'w-1/2 -translate-x-4 rotate-12'} />
            ))}
          </div>
        </Link>

        <ProductTile product={a} priority />
        <ProductTile product={b} priority className="hidden xl:block" />

        {/* Monte seu kit */}
        <Link href="/kits#monte-seu-kit" className="group relative row-span-2 overflow-hidden rounded-2xl bg-foreground p-6 text-background">
          <Package size={36} weight="duotone" className="text-flavor-yellow" />
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-display tracking-display">Monte seu kit</h2>
          <p className="mt-3 text-sm text-background/70">Escolha as barras, a caixa e o cartão. A gente embrulha com axé.</p>
          <div className="absolute -bottom-6 left-1/2 flex w-[110%] -translate-x-1/2 justify-center">
            {pool.length > 2 && deco(0, 2, 3).map((product, index) => (
              <BarPackage key={`${product.slug}-${index}`} product={product} className={cn('-mx-6 w-1/2 transition-transform duration-500', index === 1 ? 'z-10 -translate-y-6 group-hover:-translate-y-10' : 'rotate-[-10deg] group-hover:rotate-[-14deg]', index === 2 && 'rotate-[10deg] group-hover:rotate-[14deg]')} />
            ))}
          </div>
          <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:rotate-45">
            <ArrowUpRight weight="bold" />
          </span>
        </Link>

        <ProductTile product={c} />
        <ProductTile product={d} />
        <ProductTile product={e} />
        <ProductTile product={f} className="hidden md:block" />
        <ProductTile product={g} />
        <ProductTile product={h} className="hidden md:block" />
        <ProductTile product={i} />
        <ProductTile product={j} className="hidden xl:block" />
        <ProductTile product={k} className="hidden xl:block" />
        <ProductTile product={l} className="hidden xl:block" />
        <ProductTile product={m} className="hidden md:block" />
        <ProductTile product={n} className="hidden md:block" />

        {/* Premiações */}
        <Link href="/quem-somos#premios" className="group relative col-span-2 overflow-hidden rounded-2xl bg-sky p-6 md:p-8 xl:col-span-2">
          <Medal size={48} weight="duotone" />
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-display tracking-display md:text-5xl">13 prêmios internacionais</h2>
          <p className="mt-3 max-w-sm text-sm font-medium text-foreground/75">Academy of Chocolate (Londres), International Chocolate Awards (Nova York) e AVPA (Paris).</p>
          <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-foreground text-background transition-transform group-hover:rotate-45">
            <ArrowUpRight weight="bold" />
          </span>
        </Link>
      </div>
    </section>
  )
}
