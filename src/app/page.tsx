import Link from 'next/link'
import { brand } from '@/config/brand'
import { Button } from '@/components/ui/button'

// Home provisória: estrutura base enquanto o layout do Figma não chega
export default function Home() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary-foreground">
        Bean to bar brasileiro
      </span>
      <h1 className="max-w-2xl text-5xl font-bold text-primary md:text-6xl">{brand.tagline}.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{brand.description}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/produtos">Ver chocolates</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/clube">Conhecer o clube</Link></Button>
      </div>
    </section>
  )
}
