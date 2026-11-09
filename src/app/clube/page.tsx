import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarCheck, Gift, Package, Truck } from '@phosphor-icons/react/dist/ssr'
import { PlanPicker } from '@/components/club/plan-picker'
import { BarPackage } from '@/components/product/bar-package'
import { Reveal } from '@/components/motion/reveal'
import { CLUB_FAQ } from '@/data/club'
import { getCatalog } from '@/lib/server/catalog'

export const metadata: Metadata = { title: 'Clube de assinatura', description: 'Todo mês uma caixa com chocolates bean to bar brasileiros, edições limitadas e frete grátis.', alternates: { canonical: '/clube' } }

const steps = [
  { icon: Package, title: 'Escolha o plano', text: 'De 2 a 6 barras por mês, no período que fizer sentido para você.' },
  { icon: Gift, title: 'A Kaê monta a caixa', text: 'Uma seleção diferente todo mês, com edições que não vão para a loja.' },
  { icon: Truck, title: 'Chega na sua porta', text: 'Frete grátis para todo o Brasil, na primeira quinzena do mês.' },
  { icon: CalendarCheck, title: 'Você no controle', text: 'Pause, troque de plano ou cancele pela sua conta.' },
]

export default async function ClubPage() {
  const bars = (await getCatalog()).products.filter((product) => !product.soldOut).slice(0, 3)
  return (
    <>
      <section className="bg-mint">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-2">
          <div>
            <nav aria-label="Navegação estrutural" className="text-sm text-foreground/70">
              <Link href="/" className="hover:text-foreground">Início</Link> <span aria-hidden="true">/</span> <span className="text-foreground">Clube</span>
            </nav>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-display tracking-display text-white md:text-7xl">Clube de assinaturas</h1>
            <p className="mt-5 max-w-md text-lg text-foreground/80">Um Brasil novo chegando todo mês: barras bean to bar escolhidas por quem faz, com edições limitadas e frete grátis.</p>
            <a href="#planos" className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-7 font-bold text-background transition-transform hover:scale-[1.03]">Ver planos</a>
          </div>
          <div className="relative mx-auto flex w-full max-w-md justify-center" aria-hidden="true">
            {bars.map((product, index) => (
              <div key={product.slug} className="-mx-8 w-1/2" style={{ transform: `rotate(${(index - 1) * 10}deg) translateY(${Math.abs(index - 1) * 24}px)`, zIndex: index === 1 ? 2 : 1 }}>
                <BarPackage product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="font-display text-4xl font-extrabold tracking-display md:text-5xl">Como funciona</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <li className="h-full rounded-card border p-6">
                <span className="flex items-center justify-between">
                  <Icon size={32} weight="duotone" />
                  <span className="font-display text-4xl font-extrabold text-border">0{index + 1}</span>
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="planos" className="scroll-mt-36 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-display md:text-5xl">Escolha seu plano</h2>
            <p className="mt-3 text-muted-foreground">Quanto maior o período, menor o preço por mês.</p>
          </div>
          <PlanPicker />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="font-display text-4xl font-extrabold tracking-display">Dúvidas sobre o clube</h2>
        <div className="mt-8 divide-y rounded-2xl border">
          {CLUB_FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {item.q}
                <span className="text-2xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
