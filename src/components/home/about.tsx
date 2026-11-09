import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { Reveal } from '@/components/motion/reveal'

// "Um Brasil em cada barra": texto da marca (do site atual) com a foto
export function About() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="font-display text-5xl leading-display font-extrabold tracking-display md:text-6xl">
            Um Brasil em cada barra.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            A Kaê faz chocolate bean to bar (do grão à barra) bem brasileiro: cacau da Bahia, ingredientes da Amazônia,
            borogodó mineiro e administração paulistana. Sem clichês, sem falsas promessas: só poucos ingredientes e o
            objetivo de sempre buscar o melhor chocolate do mundo.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Já são 13 prêmios internacionais pela Academy of Chocolate (Londres), International Chocolate Awards (Nova
            York) e AVPA (Paris), levando nosso sabor e nossa cultura para todos os cantos do planeta.
          </p>
          <Link
            href="/quem-somos"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold tracking-[0.15em] uppercase transition-[gap] hover:gap-3"
          >
            Conheça a Kaê <ArrowRight weight="bold" />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <div
            className="absolute -top-4 -right-4 size-28 rounded-full bg-flavor-yellow md:size-36"
            aria-hidden="true"
          />
          <Image
            src="/images/home/hero.png"
            alt="Duas pessoas sorrindo e comendo barras de chocolate Kaê"
            width={694}
            height={486}
            className="relative w-full rounded-feature object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}
