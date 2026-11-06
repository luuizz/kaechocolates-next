import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Gift, Truck } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { products } from '@/data/products'

const perks = [
  { icon: Gift, title: 'Caixa surpresa todo mês', text: 'Barras da casa e edições limitadas que não vão para a loja.' },
  { icon: Truck, title: 'Frete grátis', text: 'A caixa chega na sua porta sem custo de envio.' },
  { icon: CalendarCheck, title: 'Sem fidelidade', text: 'Pause, troque de plano ou cancele quando quiser, pelo site.' },
]

// Chamada para o clube de assinatura
export function ClubTeaser() {
  return (
    <section id="clube" className="px-5 py-20 md:px-8 md:py-28">
      <div className="relative mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2.5rem] bg-flavor-pink p-8 md:p-14 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="relative z-10">
          <span className="inline-block rounded-full bg-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-background">Clube Kaê</span>
          <h2 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">
            Um Brasil novo chegando todo mês
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/80">
            Assine e receba uma seleção de barras escolhida por quem faz. Para dar de presente ou para guardar só pra você.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-background/90 p-4">
                <Icon size={26} weight="duotone" />
                <h3 className="mt-2 font-display text-base font-bold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8">
            <Link href="/clube">Ver planos <ArrowRight weight="bold" /></Link>
          </Button>
        </Reveal>

        <div className="relative min-h-80" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/30" />
          {products.slice(0, 3).map((product, index) => (
            <Image
              key={product.slug}
              src={product.image}
              alt=""
              width={311}
              height={405}
              className="absolute left-1/2 top-1/2 w-40 drop-shadow-[0_20px_24px_rgba(22,17,15,0.3)] md:w-48"
              style={{ transform: `translate(calc(-50% + ${(index - 1) * 70}px), calc(-50% + ${Math.abs(index - 1) * 18}px)) rotate(${(index - 1) * 12}deg)` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
