'use client'

import { DownloadSimple, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-page'
import { downloadShippingList } from './subscribers/csv'
import { SubscriberRow } from './subscribers/subscriber-row'
import { useSubscribers, type SubscriberFilter } from './subscribers/use-subscribers'

const FILTERS: Array<{ value: SubscriberFilter; label: string }> = [
  { value: 'caixa', label: 'Recebem caixa' },
  { value: 'active', label: 'Ativas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'todos', label: 'Todas' },
]

const COLUMNS = ['Assinante', 'Plano', 'Status', 'Próxima cobrança']

export function SubscriberList() {
  const { loaded, list, boxes, stats, filter, setFilter, search, setSearch, count, act } = useSubscribers()

  const cards = [
    { label: 'Assinaturas ativas', value: stats ? String(stats.active) : null },
    { label: 'Receita mensal recorrente', value: stats ? formatBRL(stats.mrr) : null },
    { label: 'Barras para separar no mês', value: stats ? String(stats.bars) : null },
  ]

  return (
    <>
      <AdminHeader
        title="Assinantes"
        description="Quem assina o clube e quem recebe a caixa deste mês."
        actions={
          <Button variant="outline" disabled={!loaded} onClick={() => downloadShippingList(boxes)}>
            <DownloadSimple /> Lista de envio (CSV)
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-tile bg-panel-surface p-5">
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
            {FILTERS.map((item) => {
              const selected = filter === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    'flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                    selected ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground',
                  )}
                >
                  {item.label}{' '}
                  {loaded && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-xs tabular-nums',
                        selected ? 'bg-background/20' : 'bg-secondary',
                      )}
                    >
                      {count(item.value)}
                    </span>
                  )}
                </button>
              )
            })}
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
        {!loaded ? (
          <div className="h-48 animate-pulse" />
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Nenhuma assinatura aqui ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  {COLUMNS.map((column, index) => (
                    <th key={column} scope="col" className={cn('py-3 font-semibold', index === 0 ? 'px-5' : 'px-3')}>
                      {column}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((sub) => (
                  <SubscriberRow key={sub.id} sub={sub} onAction={(action) => act(sub, action)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
