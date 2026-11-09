'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowSquareOut, SignOut } from '@phosphor-icons/react'
import { ADMIN_NAV } from '@/constants/navigation'
import { cn } from '@/lib/utils'

const isActive = (pathname: string, item: (typeof ADMIN_NAV)[number]) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href)

const linkClass = 'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors'
const idleClass = 'text-panel-sidebar-muted hover:bg-panel-sidebar-hover hover:text-panel-sidebar-foreground'

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(linkClass, active ? 'bg-panel-active text-panel-active-foreground' : idleClass)}
          >
            <Icon size={20} weight={active ? 'fill' : 'regular'} /> {item.label}
          </Link>
        )
      })}
      <div className="my-3 h-px bg-panel-sidebar-border" />
      <Link href="/" className={cn(linkClass, idleClass)}>
        <ArrowSquareOut size={20} /> Ver a loja
      </Link>
    </nav>
  )
}

type AdminUserProps = { name: string; email: string; onSignOut: () => void }

export function AdminUser({ name, email, onSignOut }: AdminUserProps) {
  return (
    <div className="mt-auto border-t border-panel-sidebar-border pt-4">
      <p className="truncate text-sm font-semibold">{name}</p>
      <p className="truncate text-xs text-panel-sidebar-muted">{email}</p>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 flex items-center gap-2 text-sm text-panel-sidebar-muted hover:text-panel-sidebar-foreground"
      >
        <SignOut size={18} /> Sair
      </button>
    </div>
  )
}
