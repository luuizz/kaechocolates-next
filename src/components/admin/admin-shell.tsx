'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { List, X } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { AdminNav, AdminUser } from './admin-nav'

type AdminShellProps = { name: string; email: string; children: React.ReactNode }

// Moldura do painel (o acesso de admin já foi conferido no servidor)
export function AdminShell({ name, email, children }: AdminShellProps) {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOn, setMenuOn] = useState<string | null>(null)
  const menuOpen = menuOn === pathname

  const signOut = async () => {
    await auth.signOut()
    router.replace('/')
  }
  const user = <AdminUser name={name} email={email} onSignOut={signOut} />

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 bg-panel-sidebar p-5 text-panel-sidebar-foreground lg:flex">
        <Link href="/admin" className="flex items-end gap-3 px-2 pt-1">
          <Logo inverted className="h-10" />{' '}
          <span className="pb-1 text-2xs font-bold tracking-[0.2em] text-panel-sidebar-muted uppercase">Painel</span>
        </Link>
        <AdminNav />
        {user}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-panel-surface px-4 lg:hidden">
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
          <div className="flex flex-col gap-4 bg-panel-sidebar p-4 text-panel-sidebar-foreground lg:hidden">
            <AdminNav />
            {user}
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  )
}
