import type { Metadata } from 'next'
import Link from 'next/link'
import { RootDocument } from '@/components/layout/root-document'
import { Button } from '@/components/ui/button'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: `Página não encontrada · ${brand.name}`,
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <RootDocument area="loja">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-4 px-4 py-24">
        <h1 className="text-4xl font-bold text-primary">Página não encontrada</h1>
        <p className="text-muted-foreground">Esse pedaço de chocolate já foi comido.</p>
        <Button asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </main>
    </RootDocument>
  )
}
