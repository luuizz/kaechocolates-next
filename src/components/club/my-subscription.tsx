'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { CalendarBlank, CircleNotch, CreditCard, MapPin, Pause, Play, Sparkle, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { formatDate, normalizeSubscription } from '@/lib/club'
import { getAccessToken, getNeon, unwrap } from '@/lib/neon'
import { cn } from '@/lib/utils'
import type { Subscription } from '@/types/club'
import { EmptyState } from '@/components/ui/empty-state'
import { SUBSCRIPTION_STATUS } from '@/constants/club'

async function callClub(method: 'GET' | 'POST', body?: unknown) {
  const token = await getAccessToken()
  const response = await fetch('/api/club/subscription', {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a assinatura.')
}

// Aba Clube da conta: assinatura atual, ações e cobranças
export function MySubscription({ justSubscribed }: { justSubscribed?: boolean }) {
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const rows = unwrap(
      await getNeon()
        .from('subscriptions')
        .select('*, subscription_payments(id,amount,status,paid_at,created_at)')
        .order('created_at', { ascending: false })
        .limit(5),
    ) as Subscription[]
    // A em andamento primeiro; se só houver canceladas, mostra a mais recente
    const current = rows.find((row) => row.status !== 'canceled') ?? rows[0] ?? null
    setSub(current ? normalizeSubscription(current) : null)
    return current
  }, [])

  useEffect(() => {
    let active = true
    // Se acabou de assinar e ainda está confirmando, consulta o Mercado Pago
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial da assinatura
    load()
      .then(async (current) => {
        if (active && current?.status === 'pending') {
          await callClub('GET').catch(() => {})
          if (active) await load()
        }
      })
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [load])

  const act = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!sub) return
    if (
      action === 'cancel' &&
      !window.confirm(
        sub.period.months === 1
          ? 'Cancelar a assinatura? A próxima cobrança não acontece e você recebe a caixa do mês já pago.'
          : `Cancelar a renovação? Você continua recebendo as caixas até o fim do período já pago.`,
      )
    )
      return
    setBusy(action)
    setError('')
    try {
      await callClub('POST', { action })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    }
    setBusy(null)
  }

  if (sub === undefined) return <div className="h-64 animate-pulse rounded-card bg-secondary" />

  if (!sub) {
    return (
      <EmptyState
        size="panel"
        titleAs="p"
        icon={<Sparkle size={26} weight="duotone" />}
        title="Você ainda não assina o clube"
        description="Todo mês uma caixa com barras da casa e edições limitadas, com frete grátis."
        action={
          <Button asChild>
            <Link href="/clube">Conhecer planos</Link>
          </Button>
        }
      />
    )
  }

  const status = SUBSCRIPTION_STATUS[sub.status]
  const a = sub.shipping_address
  const monthly = sub.period.months === 1

  return (
    <div className="flex flex-col gap-5">
      {justSubscribed && sub.status !== 'canceled' && (
        <FormMessage tone="success">
          Boas-vindas ao clube! A primeira caixa sai na próxima quinzena de envios.
        </FormMessage>
      )}
      <FormMessage>{error}</FormMessage>

      <article className="overflow-hidden rounded-card border">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-flavor-pink p-6">
          <div>
            <p className="text-xs font-bold tracking-eyebrow uppercase">Clube Kaê</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{sub.plan.name}</p>
            <p className="font-semibold">
              {sub.period.label} · {sub.plan.bars} barras por mês
            </p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-xs font-bold', status.tone)}>{status.label}</span>
        </div>
        <dl className="grid gap-5 p-6 text-sm sm:grid-cols-2">
          <Info icon={CreditCard} label="Cobrança">
            {formatBRL(sub.amount)} {monthly ? 'por mês' : `a cada ${sub.period.months} meses`}
            {sub.card_last_four && <> · cartão final {sub.card_last_four}</>}
          </Info>
          <Info icon={CalendarBlank} label={sub.status === 'canceled' ? 'Caixas até' : 'Próxima cobrança'}>
            {sub.status === 'canceled'
              ? sub.ends_at
                ? formatDate(sub.ends_at)
                : '—'
              : sub.status === 'paused'
                ? 'Pausada'
                : sub.next_payment_date
                  ? formatDate(sub.next_payment_date)
                  : 'Confirmando…'}
          </Info>
          <Info icon={MapPin} label="Entrega">
            {a.street}, {a.number}
            {a.complement ? ` · ${a.complement}` : ''} · {a.city}/{a.state}
          </Info>
          {sub.notes && (
            <Info icon={Sparkle} label="Restrições">
              {sub.notes}
            </Info>
          )}
        </dl>
        {sub.status !== 'canceled' && (
          <div className="flex flex-wrap gap-2 border-t p-5">
            {monthly && sub.status === 'active' && (
              <Button variant="outline" onClick={() => act('pause')} disabled={Boolean(busy)}>
                {busy === 'pause' ? <CircleNotch className="animate-spin" /> : <Pause />} Pausar
              </Button>
            )}
            {sub.status === 'paused' && (
              <Button onClick={() => act('resume')} disabled={Boolean(busy)}>
                {busy === 'resume' ? <CircleNotch className="animate-spin" /> : <Play />} Retomar
              </Button>
            )}
            <Button variant="ghost" className="text-destructive" onClick={() => act('cancel')} disabled={Boolean(busy)}>
              {busy === 'cancel' ? <CircleNotch className="animate-spin" /> : <X />}{' '}
              {monthly ? 'Cancelar assinatura' : 'Cancelar renovação'}
            </Button>
          </div>
        )}
        {sub.status === 'canceled' && (
          <div className="border-t p-5">
            <Button asChild>
              <Link href="/clube">Assinar de novo</Link>
            </Button>
          </div>
        )}
      </article>

      {sub.subscription_payments && sub.subscription_payments.length > 0 && (
        <section>
          <h3 className="font-display text-lg font-bold">Cobranças</h3>
          <ul className="mt-2 divide-y rounded-2xl border text-sm">
            {sub.subscription_payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>{formatDate(payment.paid_at ?? payment.created_at)}</span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    payment.status === 'approved' ? 'text-success' : 'text-destructive',
                  )}
                >
                  {payment.status === 'approved' ? 'Paga' : 'Não aprovada'}
                </span>
                <span className="font-semibold tabular-nums">{formatBRL(payment.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Info({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon size={20} weight="duotone" className="mt-0.5 shrink-0" />
      <div>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  )
}
