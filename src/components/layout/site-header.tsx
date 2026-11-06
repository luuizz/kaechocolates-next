import Link from 'next/link'
import { brand } from '@/config/brand'

const nav = [
  { href: '/produtos', label: 'Chocolates' },
  { href: '/kits', label: 'Kits' },
  { href: '/clube', label: 'Clube de assinatura' },
  { href: '/quem-somos', label: 'A Kaê' },
  { href: '/contato', label: 'Contato' },
]

// Cabeçalho provisório: o definitivo sai do Figma
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          {brand.shortName}
        </Link>
        <nav aria-label="Principal" className="hidden gap-6 text-sm font-medium md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
