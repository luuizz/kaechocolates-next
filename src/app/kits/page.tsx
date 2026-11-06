import type { Metadata } from 'next'
import Link from 'next/link'
import { AwardKit } from '@/components/kits/award-kit'
import { KitBuilder } from '@/components/kits/kit-builder'

export const metadata: Metadata = { title: 'Kits e presentes', description: 'Kit dos premiados e Monte seu kit: escolha a caixa, as barras e o recado do cartão.', alternates: { canonical: '/kits' } }

export default function KitsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Início</Link> <span aria-hidden="true">/</span> <span className="text-foreground">Kits</span>
      </nav>
      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">Kits e presentes</h1>
        <p className="mt-3 text-lg text-muted-foreground">Uma caixa da Kaê é presente que agrada até quem diz que não gosta de chocolate.</p>
      </header>

      <section id="premiados" className="mt-10 scroll-mt-40">
        <AwardKit />
      </section>

      <section id="monte-seu-kit" className="mt-24 scroll-mt-40">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Do seu jeito</p>
          <h2 className="mt-2 font-display text-5xl font-extrabold tracking-[-0.03em]">Monte seu kit</h2>
          <p className="mt-3 text-lg text-muted-foreground">Quanto maior a caixa, maior o desconto. A gente embrulha e escreve o cartão à mão.</p>
        </div>
        <KitBuilder />
      </section>
    </div>
  )
}
