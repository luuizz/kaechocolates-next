'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowSquareOut,
  Barcode,
  Gauge,
  List,
  Package,
  Receipt,
  SignOut,
  Sparkle,
  Truck,
  UserCircleCheck,
  Users,
  X,
} from '@phosphor-icons/react'
import { Toaster } from 'sonner'
import { Logo } from '@/components/brand/logo'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageLoader } from '@/components/ui/page-loader'

const NAV = [
  { href: '/admin', label: 'Visão geral', icon: Gauge, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: Receipt },
  { href: '/admin/produtos', label: 'Produtos', icon: Barcode },
  { href: '/admin/kits', label: 'Caixas de kit', icon: Package },
  { href: '/admin/assinantes', label: 'Assinantes', icon: UserCircleCheck },
  { href: '/admin/clube', label: 'Planos do clube', icon: Sparkle },
  { href: '/admin/frete', label: 'Frete', icon: Truck },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

// Moldura do painel: só abre para admin (o banco confere de novo em cada gravação)
export function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Ao sair, vai para a home em vez de cair no login
  const leaving = useRef(false)
  const [menuOn, setMenuOn] = useState<string | null>(null)
  const menuOpen = menuOn === pathname

  useEffect(() => {
    if (!leaving.current && auth.configured && !auth.loading && !auth.user)
      router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`)
  }, [auth.configured, auth.loading, auth.user, pathname, router])

  if (!auth.configured)
    return (
      <Blocked title="Painel indisponível" text="Configure as variáveis do Neon para usar o painel (veja o README)." />
    )
  if (auth.loading || !auth.user) return <PageLoader height="screen" />
  if (!auth.isAdmin)
    return (
      <Blocked
        title="Acesso restrito"
        text="Esta área é só para a equipe da loja. Se você deveria ter acesso, peça para um admin liberar sua conta."
      />
    )

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const nav = (
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
              active
                ? 'bg-background text-foreground'
                : 'text-background/75 hover:bg-background/10 hover:text-background',
            )}
          >
            <Icon size={20} weight={active ? 'fill' : 'regular'} /> {item.label}
          </Link>
        )
      })}
      <div className="my-3 h-px bg-background/15" />
      <Link
        href="/"
        className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-background/75 hover:bg-background/10 hover:text-background"
      >
        <ArrowSquareOut size={20} /> Ver a loja
      </Link>
    </nav>
  )

  const footer = (
    <div className="mt-auto border-t border-background/15 pt-4">
      <p className="truncate text-sm font-semibold">{auth.profile?.full_name || 'Admin'}</p>
      <p className="truncate text-xs text-background/60">{auth.user.email}</p>
      <button
        type="button"
        onClick={async () => {
          leaving.current = true
          await auth.signOut()
          router.replace('/')
        }}
        className="mt-3 flex items-center gap-2 text-sm text-background/75 hover:text-background"
      >
        <SignOut size={18} /> Sair
      </button>
    </div>
  )

  return (
    <div className="flex min-h-dvh bg-secondary">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 bg-foreground p-5 text-background lg:flex">
        <Link href="/admin" className="flex items-end gap-3 px-2 pt-1">
          <Logo inverted className="h-10" />{' '}
          <span className="pb-1 text-2xs font-bold tracking-[0.2em] text-background/55 uppercase">Painel</span>
        </Link>
        {nav}
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
          <Link href="/admin">
            <Logo className="h-8" />
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMenuOn(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
          </Button>
        </header>
        {menuOpen && (
          <div className="flex flex-col gap-4 bg-foreground p-4 text-background lg:hidden">
            {nav}
            {footer}
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  )
}

function Blocked({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-secondary px-5">
      <div className="max-w-md rounded-card bg-background p-8 text-center">
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

// Cabeçalho das páginas do painel
export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-heading md:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-tile bg-background p-5 md:p-6', className)}>{children}</section>
}
