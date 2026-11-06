import { CookingPot, Handshake, Recycle, Plant } from '@phosphor-icons/react/dist/ssr'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

const items = [
  { icon: Plant, color: 'bg-flavor-yellow', title: 'Cacau que vale mais', text: 'Pagamos até 200% do valor de mercado por um cacau de maior qualidade.' },
  { icon: CookingPot, color: 'bg-flavor-orange', title: 'É fermentado!', text: 'Como o pão, o queijo e o vinho, o bom chocolate depende de uma boa fermentação.' },
  { icon: Handshake, color: 'bg-flavor-blue', title: 'Comércio responsável', text: 'Acompanhamos de perto produtores e fornecedores, com uma conduta ética do início ao fim.' },
  { icon: Recycle, color: 'bg-flavor-pink', title: 'Selo eureciclo', text: 'Compensamos as embalagens e incentivamos a reciclagem pós-consumo.' },
]

const awards = ['Academy of Chocolate · Londres', 'International Chocolate Awards · Nova York', 'AVPA · Paris']

// Diferenciais e prêmios
export function Quality() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Qualidade sempre</p>
          <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">Poucos ingredientes. Nenhum atalho.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, color, title, text }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="h-full rounded-[1.75rem] border bg-card p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className={cn('grid size-14 place-items-center rounded-2xl', color)}>
                  <Icon size={28} weight="duotone" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 flex flex-col items-start gap-5 rounded-[1.75rem] bg-secondary p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <p className="font-display text-2xl font-bold md:text-3xl">13 prêmios internacionais</p>
          <ul className="flex flex-wrap gap-2">
            {awards.map((award) => (
              <li key={award} className="rounded-full border border-foreground/15 bg-background px-4 py-2 text-sm font-semibold">{award}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
