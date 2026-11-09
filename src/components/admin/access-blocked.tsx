import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

type AccessBlockedProps = { title: string; text: string }

export function AccessBlocked({ title, text }: AccessBlockedProps) {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md rounded-card bg-panel-surface p-8 text-center">
        <Logo className="mx-auto h-10" />
        <h1 className="mt-6 font-display text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{text}</p>
        <Button asChild className="mt-6">
          <Link href="/">Voltar para a loja</Link>
        </Button>
      </div>
    </div>
  )
}
