import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Leaf, Plant, Medal } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { products } from '@/data/products'
import { AwardBadge } from './award-badge'

// Barras em leque, cada uma com uma inclinação e um tempo de flutuação
const fan = [
  { slug: 'branco-com-nibs-37', tilt: '-14deg', className: 'left-[2%] top-[18%] z-10', delay: '0s' },
  { slug: 'ao-leite-48', tilt: '-4deg', className: 'left-[24%] top-[4%] z-20', delay: '-1.5s' },
  { slug: 'intenso-71', tilt: '6deg', className: 'left-[46%] top-[12%] z-30', delay: '-3s' },
  { slug: 'cupuacu-64', tilt: '15deg', className: 'left-[66%] top-[26%] z-20', delay: '-4.5s' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-24 lg:pt-16">
        <div className="relative z-10 flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
            <span className="size-2 rounded-full bg-flavor-red" /> Bean to bar brasileiro
          </span>
          <h1 className="relative z-0 font-display text-[clamp(3.2rem,7.4vw,6.6rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
            Chocolate
            <br />
            <span className="whitespace-nowrap">
            de{' '}
            <span className="relative inline-block">
              <span className="absolute inset-x-[-0.08em] bottom-[0.06em] top-[0.42em] -z-10 -rotate-2 rounded-[0.3em] bg-flavor-yellow" aria-hidden="true" />
              verdade.
            </span>
            </span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Cacau da Bahia, ingredientes amazônicos e jeitinho mineiro. Sem conservantes, sem aromatizantes e com muito axé e borogodó em cada barra.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/produtos">
                Comprar chocolates <ArrowRight weight="bold" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/clube">Assinar o clube</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium text-muted-foreground">
            <li className="flex items-center gap-2"><Medal size={20} weight="duotone" className="text-flavor-orange" /> 13 prêmios internacionais</li>
            <li className="flex items-center gap-2"><Plant size={20} weight="duotone" className="text-success" /> Do grão à barra</li>
            <li className="flex items-center gap-2"><Leaf size={20} weight="duotone" className="text-flavor-blue" /> Sem conservantes</li>
          </ul>
        </div>

        <div className="relative mx-auto aspect-[1/0.92] w-full max-w-[38rem]">
          {/* Mancha de cor atrás das barras */}
          <div className="absolute inset-[8%] rounded-[45%_55%_52%_48%/55%_45%_55%_45%] bg-flavor-yellow" aria-hidden="true" />
          <div className="absolute right-[4%] top-[2%] size-[22%] rounded-full bg-flavor-pink" aria-hidden="true" />
          <div className="absolute bottom-[10%] left-[2%] size-[14%] rounded-full bg-flavor-blue" aria-hidden="true" />
          {fan.map(({ slug, tilt, className, delay }) => {
            const product = products.find((item) => item.slug === slug)!
            return (
              <Link
                key={slug}
                href={`/produtos/${slug}`}
                aria-label={product.fullName}
                className={`group absolute w-[34%] ${className}`}
                style={{ ['--tilt' as string]: tilt, animationDelay: delay }}
              >
                <div className="animate-float drop-shadow-[0_24px_30px_rgba(22,17,15,0.25)] transition-transform duration-300 group-hover:scale-105" style={{ ['--tilt' as string]: tilt, animationDelay: delay }}>
                  <Image src={product.image} alt="" width={311} height={405} priority className="h-auto w-full" />
                </div>
              </Link>
            )
          })}
          <AwardBadge className="absolute -bottom-2 right-0 z-40 md:right-4" />
        </div>
      </div>
    </section>
  )
}
