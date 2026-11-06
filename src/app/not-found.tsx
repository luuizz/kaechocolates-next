import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-24">
      <h1 className="text-4xl font-bold text-primary">Página não encontrada</h1>
      <p className="text-muted-foreground">Esse pedaço de chocolate já foi comido.</p>
      <Button asChild><Link href="/">Voltar ao início</Link></Button>
    </section>
  )
}
