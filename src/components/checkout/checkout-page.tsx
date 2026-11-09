'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CircleNotch, CreditCard, LockSimple, MapPin, Package, PixLogo, ShoppingBagOpen, Truck, WarningCircle } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { toCheckoutItems, useCart } from '@/components/cart/cart-provider'
import { AddressPicker } from './address-picker'
import { BarPackage } from '@/components/product/bar-package'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { brand } from '@/config/brand'
import { formatBRL, installment } from '@/data/products'
import { formatCpf, validCpf } from '@/lib/cpf'
import { getAccessToken } from '@/lib/neon'
import { cn } from '@/lib/utils'
import { CardForm } from './card-form'
import type { Address } from '@/types/account'
import type { Quote } from '@/types/shipping'

type Method = 'pix' | 'card'

// Checkout em uma página: endereço → entrega → pagamento, com o resumo calculado pelo servidor
export function CheckoutPage() {
  const auth = useAuth()
  const cart = useCart()
  const router = useRouter()
  const [address, setAddress] = useState<Address | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [method, setMethod] = useState<Method>('pix')
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)

  const items = useMemo(() => toCheckoutItems(cart.items), [cart.items])
  const addressId = address?.id ?? null

  useEffect(() => {
    if (auth.configured && !auth.loading && !auth.user) router.replace('/entrar?volta=/checkout')
  }, [auth.configured, auth.loading, auth.user, router])

  // Recalcula no servidor sempre que a sacola ou o estado de entrega mudam
  const state = address?.state ?? null
  const itemsKey = JSON.stringify(items)
  useEffect(() => {
    if (!items.length) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicador de carregamento da prévia
    setQuoting(true)
    fetch('/api/checkout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, state }) })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Não foi possível calcular o pedido.')
        if (active) setQuote(body)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setQuoting(false))
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsKey representa items
  }, [itemsKey, state])

  const pay = async (payload: { method: Method; cpf: string; card?: Record<string, unknown> }) => {
    setError('')
    const token = await getAccessToken()
    if (!token) throw new Error('Sua sessão expirou. Entre de novo.')
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items, addressId, ...payload }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Não foi possível finalizar a compra.')
    setDone(true)
    cart.clear()
    router.push(`/pedido/${body.order.code}`)
  }

  const payPix = async () => {
    const digits = cpf.replace(/\D/g, '')
    if (!validCpf(digits)) return setError('Informe um CPF válido. Ele vai na nota fiscal e é exigido pelo Pix.')
    setPaying(true)
    try {
      await pay({ method: 'pix', cpf: digits })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o Pix.')
      setPaying(false)
    }
  }

  if (!auth.configured || auth.loading || !auth.user) {
    return <div className="grid min-h-[60vh] place-items-center"><CircleNotch size={32} className="animate-spin text-muted-foreground" aria-label="Carregando" /></div>
  }

  if (!cart.items.length && !done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-secondary"><ShoppingBagOpen size={30} weight="duotone" /></span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Sua sacola está vazia</h1>
        <p className="mt-2 text-muted-foreground">Escolha suas barras e volte aqui para finalizar.</p>
        <Button asChild size="lg" className="mt-6"><Link href="/produtos">Ver chocolates</Link></Button>
      </div>
    )
  }

  const problems = quote?.problems ?? []
  const ready = Boolean(address && quote && quote.zone && !problems.length && !quoting)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/carrinho" className="hover:text-foreground">Sacola</Link> <span aria-hidden="true">/</span> <span className="text-foreground">Finalizar compra</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">Finalizar compra</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <div className="flex flex-col gap-6">
          {/* 1. Endereço */}
          <Step number={1} title="Endereço de entrega" icon={MapPin}>
            <AddressPicker value={address} onChange={setAddress} />
          </Step>

          {/* 2. Entrega */}
          <Step number={2} title="Entrega" icon={Truck} muted={!address}>
            {!address ? (
              <p className="text-sm text-muted-foreground">Escolha um endereço para calcular o frete.</p>
            ) : quote?.zone ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-foreground p-4">
                <div>
                  <p className="font-semibold">Entrega padrão · {quote.zone.name}</p>
                  <p className="text-sm text-muted-foreground">Chega em {quote.zone.days_min} a {quote.zone.days_max} dias úteis depois do pagamento</p>
                </div>
                <p className="shrink-0 font-display text-lg font-extrabold">{quote.shipping === 0 ? <span className="text-success">Grátis</span> : formatBRL(quote.shipping)}</p>
              </div>
            ) : quoting ? (
              <div className="h-16 animate-pulse rounded-2xl bg-secondary" />
            ) : null}
          </Step>

          {/* 3. Pagamento */}
          <Step number={3} title="Pagamento" icon={LockSimple} muted={!ready}>
            <div role="tablist" aria-label="Forma de pagamento" className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
              {([['pix', 'Pix', PixLogo], ['card', 'Cartão de crédito', CreditCard]] as const).map(([value, label, Icon]) => (
                <button key={value} type="button" role="tab" aria-selected={method === value} onClick={() => { setMethod(value); setError('') }} className={cn('flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors', method === value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon size={20} weight={method === value ? 'fill' : 'regular'} /> {label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <FormMessage>{error}</FormMessage>
              {method === 'pix' ? (
                <div className={cn('flex flex-col gap-4', error && 'mt-4')}>
                  <p className="text-sm text-muted-foreground">Você recebe o QR Code e o código copia e cola na próxima tela. O Pix vale por 30 minutos e a aprovação é na hora.</p>
                  <Field label="CPF" hint="Vai na nota fiscal e é exigido pelo Pix.">
                    <Input value={formatCpf(cpf)} onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" className="max-w-xs" />
                  </Field>
                  <Button size="lg" className="self-start" disabled={!ready || paying} onClick={payPix}>
                    {paying ? <CircleNotch className="animate-spin" /> : <PixLogo weight="bold" />} Pagar {quote ? formatBRL(quote.total) : ''} com Pix
                  </Button>
                </div>
              ) : ready && quote ? (
                <div className={cn(error && 'mt-4')}>
                  <CardForm amount={quote.total} email={auth.user.email ?? ''} onPay={(card, cpfNumber) => pay({ method: 'card', cpf: cpfNumber, card })} onError={setError} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Escolha o endereço para liberar o pagamento com cartão.</p>
              )}
            </div>
          </Step>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-[1.75rem] bg-secondary p-6">
            <h2 className="font-display text-2xl font-extrabold">Resumo</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  {item.kind === 'product' ? (
                    <span className="w-11 shrink-0 overflow-hidden rounded-lg" style={{ background: item.product.tile }}><BarPackage product={item.product} /></span>
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-foreground text-background"><Package size={20} weight="duotone" /></span>
                  )}
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.title}</span><span className="text-muted-foreground">{item.quantity} × {formatBRL(item.unitPrice)}</span></span>
                  <span className="font-semibold tabular-nums">{formatBRL(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            {problems.length > 0 && (
              <div role="alert" className="mt-5 flex flex-col gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {problems.map((problem) => <p key={problem} className="flex gap-2"><WarningCircle size={18} className="shrink-0" /> {problem}</p>)}
                <Link href="/carrinho" className="font-semibold underline">Ajustar a sacola</Link>
              </div>
            )}
            <dl className={cn('mt-5 flex flex-col gap-2 border-t pt-5 text-sm transition-opacity', quoting && 'opacity-50')}>
              <Row label="Produtos" value={quote ? formatBRL(quote.subtotal) : '…'} />
              {quote && quote.discount > 0 && <Row label="Desconto dos kits" value={`-${formatBRL(quote.discount)}`} className="text-success" />}
              <Row label="Frete" value={!quote?.zone ? 'Escolha o endereço' : quote.shipping === 0 ? 'Grátis' : formatBRL(quote.shipping)} />
              <div className="mt-2 flex items-baseline justify-between border-t pt-3">
                <dt className="font-bold">Total</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums">{quote ? formatBRL(quote.total) : '…'}</dd>
              </div>
              {quote && <p className="text-right text-xs text-muted-foreground">ou até {brand.commerce.maxInstallments}x de {installment(quote.total, brand.commerce.maxInstallments)} no cartão</p>}
            </dl>
            {quote && quote.zone && quote.shipping > 0 && (
              <p className="mt-4 rounded-xl bg-background p-3 text-xs">Faltam <strong>{formatBRL(quote.free_from - (quote.subtotal - quote.discount))}</strong> para o frete grátis.</p>
            )}
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockSimple size={14} /> Pagamento processado pelo Mercado Pago</p>
        </aside>
      </div>
    </div>
  )
}

function Step({ number, title, icon: Icon, muted, children }: { number: number; title: string; icon: typeof MapPin; muted?: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`passo-${number}`} className={cn('rounded-[1.75rem] border p-5 transition-opacity md:p-7', muted && 'opacity-60')}>
      <h2 id={`passo-${number}`} className="mb-5 flex items-center gap-3 font-display text-xl font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">{number}</span>
        {title}
        <Icon size={20} className="ml-auto text-muted-foreground" />
      </h2>
      {children}
    </section>
  )
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
