'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CaretDown, Gauge, List, MagnifyingGlass, ShoppingBagOpen, User, X } from '@phosphor-icons/react'
import { Logo } from '@/components/brand/logo'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'
import { useCart } from '@/components/cart/cart-provider'
import { useAuth } from '@/components/auth/auth-provider'

type NavItem = { href: string; label: string; children?: { href: string; label: string }[] }

const nav: NavItem[] = [
  {
    href: '/produtos',
    label: 'Chocolates',
    children: [
      { href: '/produtos', label: 'Todos os chocolates' },
      { href: '/produtos?linha=intensos', label: 'Intensos' },
      { href: '/produtos?linha=ao-leite', label: 'Ao leite' },
      { href: '/produtos?linha=brancos', label: 'Brancos' },
    ],
  },
  {
    href: '/kits',
    label: 'Kits',
    children: [
      { href: '/kits#premiados', label: 'Kit dos premiados' },
      { href: '/kits#monte-seu-kit', label: 'Monte seu kit' },
    ],
  },
  { href: '/clube', label: 'Clube de assinatura' },
  { href: '/quem-somos', label: 'A Kaê' },
  { href: '/perguntas', label: 'Perguntas dos chocólatras' },
]

function Search({ className }: { className?: string }) {
  const router = useRouter()
  const [term, setTerm] = useState('')
  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (term.trim()) router.push(`/produtos?busca=${encodeURIComponent(term.trim())}`)
      }}
    >
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Buscar chocolates"
        aria-label="Buscar chocolates"
        className="h-11 w-full rounded-full border bg-secondary pr-11 pl-4 text-sm transition-[border-color,box-shadow,background] outline-none placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:ring-4 focus:ring-foreground/10"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute top-1 right-1 grid size-9 place-items-center rounded-full hover:bg-background"
      >
        <MagnifyingGlass size={18} weight="bold" />
      </button>
    </form>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const [scrolled, setScrolled] = useState(false)
  const cart = useCart()
  const auth = useAuth()
  const firstName = (auth.profile?.full_name || auth.user?.email || '').split(/[\s@]/)[0]
  const accountLabel = auth.user ? (firstName ? `Olá, ${firstName}` : 'Minha conta') : 'Entrar'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="bg-flavor-yellow px-4 py-2 text-center text-xs font-bold md:text-sm">
        Frete grátis acima de R$ {brand.commerce.freeShippingFrom} · até {brand.commerce.maxInstallments}x sem juros
      </div>
      <header
        className={cn(
          'sticky top-0 z-40 bg-background transition-shadow',
          scrolled && 'shadow-[0_8px_24px_-12px_rgba(17,17,17,0.18)]',
        )}
      >
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenOn(open ? null : pathname)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              className="grid size-11 place-items-center rounded-full border lg:hidden"
            >
              {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
            <Search className="hidden w-full max-w-xs lg:block" />
          </div>

          <Link href="/" aria-label={`${brand.name}, página inicial`}>
            <Logo className="h-11 md:h-12" />
          </Link>

          <div className="flex items-center justify-end gap-2">
            {auth.isAdmin && (
              <Link
                href="/admin"
                className="hidden h-11 items-center gap-2 rounded-full bg-flavor-yellow px-4 text-sm font-semibold transition-colors hover:bg-flavor-yellow/85 md:flex"
              >
                <Gauge size={20} weight="bold" /> Painel
              </Link>
            )}
            <Link
              href={auth.user ? '/conta' : '/entrar'}
              className="hidden h-11 max-w-48 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors hover:bg-secondary md:flex"
            >
              <User size={22} weight={auth.user ? 'fill' : 'regular'} className="shrink-0" />{' '}
              <span className="truncate">{auth.loading ? 'Conta' : accountLabel}</span>
            </Link>
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              aria-label={`Abrir sacola, ${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`}
              className="relative grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
            >
              <ShoppingBagOpen size={22} weight="bold" />
              <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-flavor-yellow px-1 text-2xs font-bold text-foreground tabular-nums ring-2 ring-background">
                {cart.count}
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Categorias" className="hidden bg-foreground text-background lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-8">
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-12 items-center gap-1.5 px-4 text-sm font-semibold transition-colors hover:text-flavor-yellow',
                    pathname.startsWith(item.href) && 'text-flavor-yellow',
                  )}
                >
                  {item.label}
                  {item.children && (
                    <CaretDown size={14} weight="bold" className="transition-transform group-hover:rotate-180" />
                  )}
                </Link>
                {item.children && (
                  <div className="invisible absolute top-full left-1/2 z-50 w-60 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="rounded-2xl border bg-background p-2 text-foreground shadow-xl">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {open && (
          <div
            id="menu-mobile"
            className="max-h-[calc(100dvh-8rem)] overflow-y-auto border-t bg-background px-5 pt-4 pb-8 lg:hidden"
          >
            <Search />
            <nav aria-label="Categorias" className="mt-4">
              {nav.map((item) => (
                <div key={item.href} className="border-b py-3">
                  <Link href={item.href} className="block py-1 font-display text-xl font-bold">
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-full bg-secondary px-3 py-1.5 text-sm"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href={auth.user ? '/conta' : '/entrar'} className="mt-4 flex items-center gap-2 font-semibold">
                <User size={20} /> {auth.user ? 'Minha conta' : 'Entrar ou cadastrar'}
              </Link>
              {auth.isAdmin && (
                <Link href="/admin" className="mt-3 flex items-center gap-2 font-semibold">
                  <Gauge size={20} /> Painel da loja
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
