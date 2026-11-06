'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { List, ShoppingBagOpen, User, X } from '@phosphor-icons/react'
import { Logo } from '@/components/brand/logo'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/produtos', label: 'Chocolates' },
  { href: '/kits', label: 'Kits' },
  { href: '/clube', label: 'Clube' },
  { href: '/quem-somos', label: 'A Kaê' },
  { href: '/contato', label: 'Contato' },
]

export function SiteHeader() {
  const pathname = usePathname()
  // O menu fica aberto só na página em que foi aberto: navegar já fecha
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="bg-foreground px-4 py-2 text-center text-xs font-semibold text-background md:text-sm">
        Frete grátis acima de R$ {brand.commerce.freeShippingFrom} · até {brand.commerce.maxInstallments}x sem juros
      </div>
      <header className={cn('sticky top-0 z-40 transition-[background,box-shadow] duration-300', scrolled ? 'bg-background/90 shadow-[0_1px_0_var(--border)] backdrop-blur-md' : 'bg-background')}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/" aria-label={`${brand.name}, página inicial`} className="shrink-0">
            <Logo className="h-10 md:h-11" />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 rounded-full border bg-card p-1 lg:flex">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-colors', active ? 'bg-foreground text-background' : 'hover:bg-secondary')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/conta" aria-label="Minha conta" className="hidden size-11 place-items-center rounded-full border bg-card transition-colors hover:bg-secondary sm:grid">
              <User size={20} weight="bold" />
            </Link>
            <Link href="/carrinho" aria-label="Carrinho" className="relative flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-transform hover:scale-[1.03]">
              <ShoppingBagOpen size={20} weight="bold" />
              <span className="hidden sm:inline">Sacola</span>
              <span className="grid size-5 place-items-center rounded-full bg-flavor-yellow text-[0.7rem] text-foreground">0</span>
            </Link>
            <button type="button" onClick={() => setOpenOn(open ? null : pathname)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'} className="grid size-11 place-items-center rounded-full border bg-card lg:hidden">
              {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="menu-mobile" aria-label="Principal" className="border-t bg-background px-5 pb-6 pt-2 lg:hidden">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block border-b py-4 font-display text-2xl font-bold">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  )
}
