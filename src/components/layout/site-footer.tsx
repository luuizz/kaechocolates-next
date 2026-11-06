import Link from 'next/link'
import { InstagramLogo } from '@phosphor-icons/react/dist/ssr'
import { Logo } from '@/components/brand/logo'
import { brand } from '@/config/brand'

const columns = [
  { title: 'Loja', links: [{ href: '/produtos', label: 'Chocolates' }, { href: '/kits', label: 'Kits e presentes' }, { href: '/clube', label: 'Clube de assinatura' }] },
  { title: 'A Kaê', links: [{ href: '/quem-somos', label: 'Nossa história' }, { href: '/#processo', label: 'Do grão à barra' }, { href: '/contato', label: 'Contato' }] },
  { title: 'Ajuda', links: [{ href: '/conta', label: 'Minha conta' }, { href: '/politica-privacidade', label: 'Política de privacidade' }] },
]

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-10 pt-16 md:grid-cols-[1.2fr_2fr] md:px-8">
        <div className="flex flex-col items-start gap-5">
          <Logo inverted className="h-14" />
          <p className="max-w-xs text-background/70">{brand.description}</p>
          <a href={brand.social.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-background hover:text-foreground">
            <InstagramLogo size={20} weight="bold" /> @kaechocolates
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-flavor-yellow">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-background/75 transition-colors hover:text-background">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden" aria-hidden="true">
        <p className="mx-auto max-w-7xl translate-y-[18%] px-5 font-display text-[22vw] font-extrabold leading-none tracking-[-0.06em] text-background/[0.06] md:px-8 md:text-[17rem]">
          {brand.shortName.toLowerCase()}
        </p>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-background/60 md:flex-row md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} {brand.name} · {brand.contact.city}</p>
          <p>Desenvolvido por Luiz Ricardo</p>
        </div>
      </div>
    </footer>
  )
}
