import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CookingPot, Handshake, Medal, Plant, Recycle } from '@phosphor-icons/react/dist/ssr'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'A Kaê', description: 'Chocolate bean to bar brasileiro: cacau da Bahia, ingredientes da Amazônia e borogodó mineiro.' }

const steps = [
  { title: 'Colheita e quebra do fruto', text: 'O cacau é colhido maduro na Bahia e aberto ainda na fazenda.' },
  { title: 'Fermentação e secagem', text: 'As amêndoas fermentam e secam ao sol. É aqui que nasce o sabor.' },
  { title: 'Confecção do chocolate', text: 'Torra, moagem e temperagem em pequenos lotes, até virar barra.' },
]

const values = [
  { icon: Plant, color: '#efb72d', title: 'Cacau que vale mais', text: 'Chegamos a pagar 200% do valor de mercado por um cacau de maior qualidade.' },
  { icon: CookingPot, color: '#e37a2f', title: 'É fermentado!', text: 'Como o pão, o queijo, o vinho e a cerveja, o bom chocolate depende de uma boa fermentação.' },
  { icon: Handshake, color: '#1c7cbf', title: 'Comércio responsável', text: 'Acompanhamos de perto produtores e fornecedores, com conduta ética em todo o processo.' },
  { icon: Recycle, color: '#eba3ad', title: 'Selo eureciclo', text: 'Compensamos nossas embalagens e incentivamos a reciclagem.' },
]

const awards = [
  { name: 'Academy of Chocolate', city: 'Londres' },
  { name: 'International Chocolate Awards', city: 'Nova York' },
  { name: 'AVPA', city: 'Paris' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader title="Um Brasil em cada barra." crumb="A Kaê" description="A Kaê faz chocolate bean to bar (do grão à barra) bem brasileiro: cacau da Bahia, ingredientes da Amazônia, borogodó mineiro e administração paulistana." />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Image src="/images/home/hero.png" alt="Duas pessoas sorrindo com barras de chocolate Kaê nas mãos" width={694} height={486} className="w-full rounded-[2rem] object-cover" />
        </Reveal>
        <Reveal delay={0.1} className="text-lg leading-relaxed text-muted-foreground">
          <p>Sem clichês, sem falsas promessas: só poucos ingredientes e o objetivo de sempre buscar o melhor chocolate do mundo.</p>
          <p className="mt-4">Assim é o Kaê, um chocolate puro que traz em sua barra a rica história do cacau brasileiro. Aqui não entram conservantes nem aromatizantes artificiais, e cada barra é feita artesanalmente com muito axé e borogodó.</p>
        </Reveal>
      </section>

      <section id="processo" className="scroll-mt-36 bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-flavor-yellow">Bean to bar</p>
            <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em]">27 dias por uma barra</h2>
            <p className="mt-5 max-w-lg text-lg text-background/70">Da colheita do fruto até virar uma barra de chocolate, trabalhamos em média 27 dias seguidos, em 3 etapas.</p>
            <ol className="mt-8 flex flex-col gap-3">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-5 rounded-2xl border border-background/10 bg-background/5 p-5">
                  <span className="font-display text-3xl font-extrabold text-flavor-yellow">0{index + 1}</span>
                  <div><h3 className="font-display text-lg font-bold">{step.title}</h3><p className="mt-1 text-background/70">{step.text}</p></div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1}>
            <Image src="/images/home/do-grao-a-barra.png" alt="Barra de chocolate Kaê quebrada: menos açúcar, menos ingredientes, muito mais sabor" width={592} height={580} className="mx-auto w-full max-w-lg rounded-[2rem] bg-background p-6" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Qualidade sempre</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, color, title, text }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="h-full rounded-[1.75rem] border p-6">
                <span className="grid size-14 place-items-center rounded-2xl" style={{ background: color }}><Icon size={28} weight="duotone" /></span>
                <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="premios" className="scroll-mt-36 px-5 pb-20 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] bg-[#a9d8ef] p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <Medal size={48} weight="duotone" />
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">13 prêmios internacionais</h2>
            <p className="mt-3 max-w-md text-foreground/75">Levando nosso sabor e nossa cultura para todos os cantos do planeta.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {awards.map((award) => (
              <li key={award.name} className="rounded-2xl bg-background px-5 py-4"><strong className="block font-display">{award.name}</strong><span className="text-sm text-muted-foreground">{award.city}</span></li>
            ))}
          </ul>
        </div>
        <div className="mt-12 flex justify-center"><Button asChild size="lg"><Link href="/produtos">Provar os premiados</Link></Button></div>
      </section>
    </>
  )
}
