'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarCheck, Check, CreditCard, MapPin, Sparkle } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { useCatalog } from '@/components/catalog/catalog-provider'
import { AddressPicker } from '@/components/checkout/address-picker'
import { CardForm } from '@/components/checkout/card-form'
import { FormMessage, Textarea } from '@/components/ui/field'
import { planPrice } from '@/data/club'
import { formatBRL } from '@/data/products'
import { getAccessToken } from '@/lib/neon'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/account'
import { PageLoader } from '@/components/ui/page-loader'

// Assinatura do clube: plano + período, endereço das caixas e cartão
export function SubscribePage() {
  const auth = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const { plans, periods } = useCatalog()
  const [planId, setPlanId] = useState(
    params.get('plano') ?? plans.find((plan) => plan.featured)?.id ?? plans[0]?.id ?? '',
  )
  const [periodId, setPeriodId] = useState(params.get('periodo') ?? periods[0]?.id ?? '')
  const [address, setAddress] = useState<Address | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const next = `/clube/assinar?plano=${planId}&periodo=${periodId}`
  useEffect(() => {
    if (auth.configured && !auth.loading && !auth.user) router.replace(`/entrar?volta=${encodeURIComponent(next)}`)
  }, [auth.configured, auth.loading, auth.user, next, router])

  const plan = plans.find((item) => item.id === planId) ?? plans[0]
  const period = periods.find((item) => item.id === periodId) ?? periods[0]

  if (!auth.user || !plan || !period) {
    return <PageLoader height="page" />
  }

  const price = planPrice(plan, period)

  const subscribe = async (card: { token: string }, cpf: string) => {
    setError('')
    const token = await getAccessToken()
    const response = await fetch('/api/club/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        plan: plan.id,
        period: period.id,
        addressId: address?.id,
        cpf,
        notes,
        card: { token: card.token },
      }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Não foi possível assinar.')
    router.push('/conta?aba=clube&assinou=1')
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-24 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/clube" className="hover:text-foreground">
          Clube
        </Link>{' '}
        <span aria-hidden="true">/</span> <span className="text-foreground">Assinar</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl leading-display font-extrabold tracking-display md:text-6xl">
        Assinar o clube
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <div className="flex flex-col gap-6">
          <Section number={1} title="Plano" icon={Sparkle}>
            <div role="radiogroup" aria-label="Plano" className="grid gap-3 sm:grid-cols-3">
              {plans.map((item) => {
                const active = item.id === plan.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPlanId(item.id)}
                    className={cn(
                      'relative rounded-2xl border-2 p-4 text-left transition-colors',
                      active ? 'border-foreground bg-secondary' : 'hover:border-foreground/40',
                    )}
                  >
                    {active && <Check size={18} weight="bold" className="absolute top-3 right-3" />}
                    <span className="mb-2 block h-1.5 w-10 rounded-full" style={{ background: item.color }} />
                    <span className="block font-display text-lg font-extrabold">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.bars} barras por mês</span>
                  </button>
                )
              })}
            </div>
            <div role="radiogroup" aria-label="Período" className="mt-4 flex flex-wrap gap-2">
              {periods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === period.id}
                  onClick={() => setPeriodId(item.id)}
                  className={cn(
                    'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                    item.id === period.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'hover:border-foreground',
                  )}
                >
                  {item.label}{' '}
                  {item.discount > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-2xs',
                        item.id === period.id ? 'bg-flavor-yellow text-foreground' : 'bg-success/15 text-success',
                      )}
                    >
                      {item.note}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Section>

          <Section number={2} title="Onde as caixas chegam" icon={MapPin}>
            <AddressPicker value={address} onChange={setAddress} label="Endereço das caixas" />
            <label className="mt-5 block text-sm font-semibold" htmlFor="clube-notas">
              Alguma restrição? <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              id="clube-notas"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ex.: sem castanhas, sem lactose, prefiro intensos…"
              className="mt-2"
            />
          </Section>

          <Section number={3} title="Cartão" icon={CreditCard} muted={!address}>
            <p className="mb-4 text-sm text-muted-foreground">
              A cobrança de {formatBRL(price.total)} acontece agora e se repete{' '}
              {period.months === 1 ? 'todo mês' : `a cada ${period.months} meses`}, no mesmo cartão.{' '}
              {period.months === 1 ? 'Pause ou cancele quando quiser.' : 'Cancele a renovação quando quiser.'}
            </p>
            <FormMessage>{error}</FormMessage>
            {address ? (
              <div className={cn(error && 'mt-4')}>
                <CardForm
                  key={`${plan.id}-${period.id}`}
                  amount={price.total}
                  email={auth.user.email ?? ''}
                  maxInstallments={1}
                  submitLabel="Assinar o clube"
                  onPay={subscribe}
                  onError={setError}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Escolha o endereço para liberar o cartão.</p>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-card p-6" style={{ background: plan.color }}>
            <p className="text-xs font-bold tracking-eyebrow uppercase">Sua assinatura</p>
            <p className="mt-2 font-display text-4xl leading-none font-extrabold tracking-heading">{plan.name}</p>
            <p className="mt-1 font-semibold">
              {period.label} · {plan.bars} barras por mês
            </p>
            <div className="mt-6 rounded-2xl bg-background p-5">
              <p className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold">{formatBRL(price.monthly)}</span>
                <span className="text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {period.months > 1 ? `${formatBRL(price.total)} a cada ${period.months} meses` : 'Cobrado todo mês'}
              </p>
              <ul className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check size={16} weight="bold" className="shrink-0 text-success" /> {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CalendarCheck size={14} /> Caixas enviadas na primeira quinzena de cada mês
          </p>
        </aside>
      </div>
    </div>
  )
}

function Section({
  number,
  title,
  icon: Icon,
  muted,
  children,
}: {
  number: number
  title: string
  icon: typeof MapPin
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={`clube-passo-${number}`}
      className={cn('rounded-card border p-5 transition-opacity md:p-7', muted && 'opacity-60')}
    >
      <h2 id={`clube-passo-${number}`} className="mb-5 flex items-center gap-3 font-display text-xl font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">
          {number}
        </span>
        {title}
        <Icon size={20} className="ml-auto text-muted-foreground" />
      </h2>
      {children}
    </section>
  )
}
