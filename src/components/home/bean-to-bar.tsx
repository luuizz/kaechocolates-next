import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

const steps = [
  { title: 'Colheita e quebra', text: 'O fruto é colhido maduro na Bahia e aberto à mão, ainda na fazenda.' },
  { title: 'Fermentação e secagem', text: 'As amêndoas fermentam e secam ao sol: é aqui que nasce o sabor.' },
  { title: 'Torra e barra', text: 'Torramos, moemos e temperamos em pequenos lotes, até virar barra.' },
]

// "Do grão à barra": explica o bean to bar em três etapas
export function BeanToBar() {
  return (
    <section id="processo" className="bg-foreground py-20 text-background md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="absolute inset-[10%] rounded-full bg-flavor-orange/25 blur-3xl" aria-hidden="true" />
          <Image src="/images/home/do-grao-a-barra.png" alt="Barra de chocolate Kaê quebrada: menos açúcar, menos ingredientes, muito mais sabor" width={592} height={580} className="relative mx-auto w-full max-w-lg rounded-[2rem] bg-background p-6" />
        </Reveal>
        <div>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-flavor-yellow">Bean to bar</p>
            <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">
              Do grão à barra em <span className="text-flavor-yellow">27 dias</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-background/70">
              Cuidamos de todo o processo, das amêndoas do cacau até o produto final, usando só ingredientes naturais e de origem. O resultado é um chocolate com identidade, marcante e claro.
            </p>
          </Reveal>
          <ol className="mt-10 flex flex-col gap-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <li className="flex gap-5 rounded-2xl border border-background/10 bg-background/5 p-5">
                  <span className="font-display text-4xl font-extrabold leading-none text-flavor-yellow">0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{step.title}</h3>
                    <p className="mt-1 text-background/70">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Button asChild variant="accent" size="lg" className="mt-8">
            <Link href="/quem-somos">Conheça a Kaê <ArrowRight weight="bold" /></Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
