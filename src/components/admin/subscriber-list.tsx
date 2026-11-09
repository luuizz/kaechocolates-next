'use client'

import { useEffect, useMemo, useState } from 'react'
import { DownloadSimple, MagnifyingGlass, Pause, Play, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { listSubscriptions, manageSubscription } from '@/lib/admin-api'
import { SUBSCRIPTION_STATUS, formatDate, receivesBox } from '@/lib/club'
import { cn, formatPhone } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'
import type { Subscription } from '@/types/club'

type Filter = 'caixa' | 'active' | 'paused' | 'canceled' | 'todos'
const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'caixa', label: 'Recebem caixa' },
  { value: 'active', label: 'Ativas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'todos', label: 'Todas' },
]

// Lista de envio do mês em CSV (abre no Excel/Sheets; separador ; e BOM para acentos)
function downloadCsv(rows: Subscription[]) {
  const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const header = [
    'Nome',
    'Plano',
    'Barras',
    'Restrições',
    'Destinatário',
    'Endereço',
    'Complemento',
    'Bairro',
    'Cidade',
    'UF',
    'CEP',
    'Telefone',
    'E-mail',
  ]
  const lines = rows.map((sub) => {
    const a = sub.shipping_address
    return [
      sub.customer.name,
      sub.plan.name,
      sub.plan.bars,
      sub.notes,
      a.recipient,
      `${a.street}, ${a.number}`,
      a.complement,
      a.district,
      a.city,
      a.state,
      a.cep.replace(/^(\d{5})/, '$1-'),
      sub.customer.phone ? formatPhone(sub.customer.phone) : '',
      sub.customer.email,
    ]
      .map(cell)
      .join(';')
  })
  const blob = new Blob(['﻿' + [header.map(cell).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `clube-envios-${new Date().toISOString().slice(0, 7)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function SubscriberList() {
  const [subs, setSubs] = useState<Subscription[] | null>(null)
  const [now, setNow] = useState(0)
  const [filter, setFilter] = useState<Filter>('caixa')
  const [search, setSearch] = useState('')

  const load = () =>
    listSubscriptions()
      .then((rows) => {
        setSubs(rows)
        setNow(Date.now())
      })
      .catch((err) => toast.error(err.message))
  useEffect(() => {
    load()
  }, [])

  const matches = (sub: Subscription, value: Filter) =>
    value === 'todos' ? sub.status !== 'pending' : value === 'caixa' ? receivesBox(sub, now) : sub.status === value
  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (subs ?? []).filter(
      (sub) =>
        matches(sub, filter) &&
        (!term ||
          `${sub.customer.name} ${sub.customer.email} ${sub.shipping_address.city}`.toLowerCase().includes(term)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches depende só de now
  }, [subs, filter, search, now])

  const active = (subs ?? []).filter((sub) => sub.status === 'active')
  const mrr = active.reduce((total, sub) => total + sub.monthly, 0)
  const bars = (subs ?? []).filter((sub) => receivesBox(sub, now)).reduce((total, sub) => total + sub.plan.bars, 0)

  const act = async (sub: Subscription, action: 'pause' | 'resume' | 'cancel') => {
    if (
      action === 'cancel' &&
      !window.confirm(`Cancelar a assinatura de ${sub.customer.name}? As próximas cobranças não acontecem.`)
    )
      return
    try {
      await manageSubscription(sub.id, action)
      toast.success('Assinatura atualizada.')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    }
  }

  return (
    <>
      <AdminHeader
        title="Assinantes"
        description="Quem assina o clube e quem recebe a caixa deste mês."
        actions={
          <Button
            variant="outline"
            disabled={!subs}
            onClick={() => downloadCsv((subs ?? []).filter((sub) => receivesBox(sub, now)))}
          >
            <DownloadSimple /> Lista de envio (CSV)
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Assinaturas ativas', value: subs ? String(active.length) : null },
          { label: 'Receita mensal recorrente', value: subs ? formatBRL(mrr) : null },
          { label: 'Barras para separar no mês', value: subs ? String(bars) : null },
        ].map((card) => (
          <div key={card.label} className="rounded-tile bg-background p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            {card.value === null ? (
              <span className="mt-1 block h-9 w-20 animate-pulse rounded-lg bg-secondary" />
            ) : (
              <p className="font-display text-3xl font-extrabold tabular-nums">{card.value}</p>
            )}
          </div>
        ))}
      </div>
      <Panel className="p-0 md:p-0">
        <div className="flex flex-col gap-3 border-b p-4 md:p-5">
          <div role="tablist" aria-label="Filtrar assinantes" className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                  filter === item.value ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground',
                )}
              >
                {item.label}{' '}
                {subs && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs tabular-nums',
                      filter === item.value ? 'bg-background/20' : 'bg-secondary',
                    )}
                  >
                    {subs.filter((sub) => matches(sub, item.value)).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, e-mail ou cidade"
              aria-label="Buscar assinantes"
              className="h-11 pl-10"
            />
          </div>
        </div>
        {!subs ? (
          <div className="h-48 animate-pulse" />
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Nenhuma assinatura aqui ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Assinante
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Plano
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Próxima cobrança
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-5 py-3">
                      <span className="block font-semibold">{sub.customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {sub.customer.email} · {sub.shipping_address.city}/{sub.shipping_address.state}
                      </span>
                      {sub.notes && (
                        <span className="mt-1 block text-xs text-muted-foreground italic">“{sub.notes}”</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="block font-semibold">
                        {sub.plan.name} · {sub.plan.bars} barras
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sub.period.label} · {formatBRL(sub.amount)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-bold',
                          SUBSCRIPTION_STATUS[sub.status].tone,
                        )}
                      >
                        {SUBSCRIPTION_STATUS[sub.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {sub.status === 'canceled'
                        ? sub.ends_at
                          ? `caixas até ${formatDate(sub.ends_at)}`
                          : '—'
                        : sub.status === 'paused'
                          ? '—'
                          : sub.next_payment_date
                            ? formatDate(sub.next_payment_date)
                            : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {sub.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => act(sub, 'pause')}
                            aria-label={`Pausar ${sub.customer.name}`}
                          >
                            <Pause />
                          </Button>
                        )}
                        {sub.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => act(sub, 'resume')}
                            aria-label={`Retomar ${sub.customer.name}`}
                          >
                            <Play />
                          </Button>
                        )}
                        {sub.status !== 'canceled' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => act(sub, 'cancel')}
                            aria-label={`Cancelar ${sub.customer.name}`}
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
