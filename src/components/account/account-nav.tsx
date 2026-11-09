'use client'

import Link from 'next/link'
import { Gauge, SignOut } from '@phosphor-icons/react'
import { ACCOUNT_TABS } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import type { AccountTabId } from '@/types/account'

type AccountNavProps = { tab: AccountTabId; firstName: string; email: string; isAdmin: boolean; onSignOut: () => void }

export function AccountNav({ tab, firstName, email, isAdmin, onSignOut }: AccountNavProps) {
  return (
    <aside className="lg:sticky lg:top-36 lg:self-start">
      <p className="font-display text-2xl font-extrabold">Oi, {firstName}!</p>
      <p className="truncate text-sm text-muted-foreground">{email}</p>
      <nav
        aria-label="Seções da conta"
        className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
      >
        {ACCOUNT_TABS.map(({ id, label, icon: TabIcon }) => (
          <Link
            key={id}
            href={`/conta?aba=${id}`}
            scroll={false}
            aria-current={tab === id ? 'page' : undefined}
            className={cn(
              'flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition-colors',
              tab === id ? 'bg-foreground text-background' : 'hover:bg-secondary',
            )}
          >
            <TabIcon size={18} weight={tab === id ? 'fill' : 'regular'} /> {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-flavor-yellow px-4 text-sm font-semibold hover:bg-flavor-yellow/85"
          >
            <Gauge size={18} weight="bold" /> Painel da loja
          </Link>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-destructive"
        >
          <SignOut size={18} /> Sair
        </button>
      </nav>
    </aside>
  )
}
