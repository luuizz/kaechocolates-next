'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { MySubscription } from '@/components/club/my-subscription'
import { PageLoader } from '@/components/ui/page-loader'
import { ACCOUNT_TABS, AccountNav, type AccountTabId } from './account-nav'
import { AddressBook } from './address-book'
import { TabTitle } from './tab-title'
import { OrdersTab } from './tabs/orders-tab'
import { PasswordTab } from './tabs/password-tab'
import { ProfileTab } from './tabs/profile-tab'

export function AccountPage() {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Ao sair, vai para a home em vez de cair no login
  const leaving = useRef(false)
  const params = useSearchParams()
  const requested = params.get('aba')
  const tab: AccountTabId = ACCOUNT_TABS.some((item) => item.id === requested) ? (requested as AccountTabId) : 'pedidos'

  useEffect(() => {
    if (!leaving.current && auth.configured && !auth.loading && !auth.user)
      router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`)
  }, [auth.configured, auth.loading, auth.user, pathname, router])

  if (!auth.configured) {
    return <p className="rounded-2xl bg-secondary p-5 text-sm">O login ainda não está ligado neste ambiente.</p>
  }
  if (auth.loading || !auth.user) return <PageLoader />

  const signOut = async () => {
    leaving.current = true
    await auth.signOut()
    router.replace('/')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
      <AccountNav
        tab={tab}
        firstName={(auth.profile?.full_name || auth.user.email || '').split(/[\s@]/)[0] ?? ''}
        email={auth.user.email ?? ''}
        isAdmin={auth.isAdmin}
        onSignOut={signOut}
      />

      <section aria-labelledby="titulo-aba" className="min-w-0">
        {tab === 'pedidos' && <OrdersTab />}
        {tab === 'clube' && (
          <>
            <TabTitle>Clube</TabTitle>
            <MySubscription justSubscribed={params.get('assinou') === '1'} />
          </>
        )}
        {tab === 'enderecos' && (
          <>
            <TabTitle>Endereços</TabTitle>
            <AddressBook />
          </>
        )}
        {tab === 'dados' && <ProfileTab />}
        {tab === 'senha' && <PasswordTab />}
      </section>
    </div>
  )
}
