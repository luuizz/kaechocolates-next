'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CaretRight, CircleNotch, Gauge, IdentificationCard, Key, MapPin, Package, Sparkle, SignOut } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { getNeon, unwrap } from '@/lib/neon'
import { cn, formatPhone } from '@/lib/utils'
import { AddressBook } from './address-book'
import { MySubscription } from '@/components/club/my-subscription'
import { StatusBadge } from '@/components/orders/order-parts'
import { formatBRL } from '@/data/products'
import { formatDateTime, type OrderStatus } from '@/lib/orders'

const TABS = [
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'clube', label: 'Clube', icon: Sparkle },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
  { id: 'dados', label: 'Meus dados', icon: IdentificationCard },
  { id: 'senha', label: 'Senha', icon: Key },
] as const
type TabId = (typeof TABS)[number]['id']

export function AccountPage() {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Ao sair, vai para a home em vez de cair no login
  const leaving = useRef(false)
  const params = useSearchParams()
  const requested = params.get('aba')
  const tab: TabId = TABS.some((item) => item.id === requested) ? (requested as TabId) : 'pedidos'

  useEffect(() => {
    if (!leaving.current && auth.configured && !auth.loading && !auth.user) router.replace(`/entrar?volta=${encodeURIComponent(pathname)}`)
  }, [auth.configured, auth.loading, auth.user, pathname, router])

  if (!auth.configured) {
    return <p className="rounded-2xl bg-secondary p-5 text-sm">O login ainda não está ligado neste ambiente.</p>
  }
  if (auth.loading || !auth.user) {
    return <div className="grid min-h-80 place-items-center"><CircleNotch size={32} className="animate-spin text-muted-foreground" aria-label="Carregando" /></div>
  }

  const firstName = (auth.profile?.full_name || auth.user.email || '').split(/[\s@]/)[0]

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <p className="font-display text-2xl font-extrabold">Oi, {firstName}!</p>
        <p className="truncate text-sm text-muted-foreground">{auth.user.email}</p>
        <nav aria-label="Seções da conta" className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/conta?aba=${id}`}
              scroll={false}
              aria-current={tab === id ? 'page' : undefined}
              className={cn('flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition-colors', tab === id ? 'bg-foreground text-background' : 'hover:bg-secondary')}
            >
              <Icon size={18} weight={tab === id ? 'fill' : 'regular'} /> {label}
            </Link>
          ))}
          {auth.isAdmin && (
            <Link href="/admin" className="flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-flavor-yellow px-4 text-sm font-semibold hover:bg-flavor-yellow/85">
              <Gauge size={18} weight="bold" /> Painel da loja
            </Link>
          )}
          <button type="button" onClick={async () => { leaving.current = true; await auth.signOut(); router.replace('/') }} className="flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-destructive">
            <SignOut size={18} /> Sair
          </button>
        </nav>
      </aside>

      <section aria-labelledby="titulo-aba" className="min-w-0">
        {tab === 'pedidos' && <Orders />}
        {tab === 'clube' && <Club />}
        {tab === 'enderecos' && <><Title>Endereços</Title><AddressBook /></>}
        {tab === 'dados' && <Profile />}
        {tab === 'senha' && <ChangePassword />}
      </section>
    </div>
  )
}

function Title({ children, description }: { children: React.ReactNode; description?: string }) {
  return (
    <header className="mb-6">
      <h2 id="titulo-aba" className="font-display text-3xl font-extrabold tracking-[-0.02em]">{children}</h2>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </header>
  )
}

function Empty({ icon: Icon, title, text, action }: { icon: typeof Package; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-secondary"><Icon size={26} weight="duotone" /></span>
      <p className="mt-4 font-display text-xl font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      <div className="mt-6">{action}</div>
    </div>
  )
}

// Pedidos e assinatura entram junto com o checkout (Mercado Pago)
type OrderRow = { id: number; code: string; status: OrderStatus; total: number | string; created_at: string; payment_method: 'pix' | 'card'; order_items: { quantity: number }[] }

function Orders() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getNeon().from('orders').select('id,code,status,total,created_at,payment_method,order_items(quantity)').order('created_at', { ascending: false }).limit(50)
      .then((result: { data: unknown; error: unknown }) => setOrders(unwrap(result) as OrderRow[]))
      .catch((err: Error) => { setError(err.message); setOrders([]) })
  }, [])

  return (
    <>
      <Title>Pedidos</Title>
      <FormMessage>{error}</FormMessage>
      {orders === null ? (
        <div className="flex flex-col gap-3">{[0, 1].map((index) => <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-secondary" />)}</div>
      ) : orders.length === 0 ? (
        <Empty icon={Package} title="Nenhum pedido ainda" text="Quando você fizer uma compra, o pedido e o rastreio aparecem aqui." action={<Button asChild><Link href="/produtos">Ver chocolates</Link></Button>} />
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const count = order.order_items.reduce((total, item) => total + item.quantity, 0)
            return (
              <li key={order.id}>
                <Link href={`/pedido/${order.code}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[1.5rem] border p-5 transition-colors hover:border-foreground">
                  <span className="min-w-32">
                    <span className="block font-display text-lg font-extrabold">{order.code}</span>
                    <span className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</span>
                  </span>
                  <StatusBadge status={order.status} />
                  <span className="ml-auto text-right text-sm">
                    <span className="block font-semibold">{formatBRL(Number(order.total))}</span>
                    <span className="text-muted-foreground">{count} {count === 1 ? 'item' : 'itens'} · {order.payment_method === 'pix' ? 'Pix' : 'Cartão'}</span>
                  </span>
                  <CaretRight size={18} className="text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function Club() {
  const justSubscribed = useSearchParams().get('assinou') === '1'
  return (
    <>
      <Title>Clube</Title>
      <MySubscription justSubscribed={justSubscribed} />
    </>
  )
}

function Profile() {
  const auth = useAuth()
  const [form, setForm] = useState({ full_name: auth.profile?.full_name ?? '', phone: auth.profile?.phone ?? '' })
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!auth.profile) return
    if (form.full_name.trim().length < 2) return setMessage({ tone: 'error', text: 'Informe seu nome.' })
    setBusy(true)
    setMessage(null)
    try {
      const phone = form.phone.replace(/\D/g, '')
      const rows = unwrap(await getNeon().from('profiles').update({ full_name: form.full_name.trim(), phone: phone || null }).eq('id', auth.profile.id).select()) as typeof auth.profile[]
      if (rows[0]) auth.setProfile(rows[0])
      setMessage({ tone: 'success', text: 'Dados salvos.' })
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível salvar.' })
    }
    setBusy(false)
  }

  return (
    <>
      <Title description="Usados nos pedidos e para falarmos com você sobre a entrega.">Meus dados</Title>
      <form onSubmit={submit} noValidate className="flex max-w-lg flex-col gap-4">
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
        <Field label="Nome completo"><Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} autoComplete="name" /></Field>
        <Field label="E-mail" hint="O e-mail é o login da conta e não pode ser trocado aqui."><Input value={auth.user?.email ?? ''} disabled /></Field>
        <Field label="Celular (WhatsApp)" hint="Com DDD."><Input value={formatPhone(form.phone)} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 11) })} inputMode="tel" autoComplete="tel-national" placeholder="(35) 99999-9999" /></Field>
        <Button type="submit" size="lg" className="self-start" disabled={busy}>{busy && <CircleNotch className="animate-spin" />} Salvar</Button>
      </form>
    </>
  )
}

function ChangePassword() {
  const auth = useAuth()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    if (!form.current) return setMessage({ tone: 'error', text: 'Informe a senha atual.' })
    if (form.next.length < 8) return setMessage({ tone: 'error', text: 'A nova senha precisa ter pelo menos 8 caracteres.' })
    if (form.next !== form.confirm) return setMessage({ tone: 'error', text: 'As senhas não conferem.' })
    setBusy(true)
    try {
      await auth.changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      setMessage({ tone: 'success', text: 'Senha trocada.' })
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível trocar a senha.' })
    }
    setBusy(false)
  }

  return (
    <>
      <Title>Senha</Title>
      <form onSubmit={submit} noValidate className="flex max-w-lg flex-col gap-4">
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
        <Field label="Senha atual"><Input type="password" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} autoComplete="current-password" /></Field>
        <Field label="Nova senha" hint="Pelo menos 8 caracteres."><Input type="password" value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} autoComplete="new-password" /></Field>
        <Field label="Repita a nova senha"><Input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} autoComplete="new-password" /></Field>
        <Button type="submit" size="lg" className="self-start" disabled={busy}>{busy && <CircleNotch className="animate-spin" />} Trocar senha</Button>
      </form>
    </>
  )
}
