import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { flavorClass, formatBRL, installment, products } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

// Vitrine dos sabores: um cartão na cor de cada embalagem, com rolagem lateral
export function FlavorRail() {
  return (
    <section id="sabores" className="py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 md:flex-row md:items-end md:justify-between md:px-8">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Nossos chocolates</p>
          <h2 className="mt-3 max-w-xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">
            Escolha seu sabor de Brasil
          </h2>
        </Reveal>
        <Button asChild variant="outline" className="self-start md:self-auto">
          <Link href="/produtos">
            Ver todos <ArrowUpRight weight="bold" />
          </Link>
        </Button>
      </div>

      <div
        className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        // Começa alinhado ao conteúdo da página e rola até a borda da tela
        style={{ paddingInline: 'max(1.25rem, calc((100vw - 80rem) / 2 + 2rem))' }}
      >
        {products.map((product, index) => {
          const color = flavorClass[product.flavor]
          return (
            <Reveal key={product.slug} delay={index * 0.06} className="snap-start">
              <Link
                href={`/produtos/${product.slug}`}
                className={cn(
                  'group relative flex h-[30rem] w-[17.5rem] shrink-0 flex-col overflow-hidden rounded-[2rem] p-6 text-foreground transition-transform duration-300 hover:-translate-y-2 md:w-[19rem]',
                  color.bg,
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-7xl font-extrabold leading-none tracking-[-0.05em] text-foreground/90">
                    {product.cacao}
                    <span className="text-3xl">%</span>
                  </span>
                  <span className="grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight weight="bold" size={20} />
                  </span>
                </div>
                <Image
                  src={product.image}
                  alt={product.fullName}
                  width={311}
                  height={405}
                  className="absolute -bottom-6 left-1/2 w-[72%] -translate-x-1/2 rotate-[-6deg] drop-shadow-[0_24px_24px_rgba(22,17,15,0.3)] transition-transform duration-500 group-hover:-translate-y-3 group-hover:rotate-0"
                />
                <div className="relative z-10 mt-2">
                  <h3 className="font-display text-2xl font-bold leading-tight">{product.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-foreground/75">
                    {formatBRL(product.price)} <span className="font-normal">· 7x de {installment(product.price)}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
