'use client'

import { CircleNotch, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { listPeriods, listPlans } from '@/lib/admin-api'
import { AdminHeader, Panel } from './admin-shell'
import { PeriodsTable } from './club/periods-table'
import { PlanCard } from './club/plan-card'
import { useListEditor } from './list-editor'
import type { AdminPeriod, AdminPlan } from '@/types/club'

const newPlan = (count: number): AdminPlan => ({
  id: `plano-${count + 1}`,
  name: 'Novo plano',
  bars: 3,
  price: 89.9,
  color: '#5fc2b0',
  pitch: '',
  perks: ['Frete grátis'],
  featured: false,
  active: false,
  sort_order: 0,
})

const newPeriod = (count: number): AdminPeriod => ({
  id: `periodo-${count + 1}`,
  label: 'Anual',
  months: 12,
  discount: 0.15,
  note: '15% off',
  active: false,
  sort_order: 0,
})

export function ClubEditor() {
  const plans = useListEditor<AdminPlan>('club_plans', listPlans)
  const periods = useListEditor<AdminPeriod>('club_periods', listPeriods)
  const saving = plans.saving || periods.saving

  const submit = async () => {
    if (plans.dirty)
      await plans.save(
        (rows) =>
          rows.find((row) => !row.name.trim() || !row.id || row.bars < 1 || !(row.price > 0))
            ? 'Cada plano precisa de nome, código, barras e preço.'
            : null,
        (row) => ({
          name: row.name.trim(),
          bars: row.bars,
          price: row.price,
          color: row.color,
          pitch: row.pitch.trim(),
          perks: row.perks.map((perk) => perk.trim()).filter(Boolean),
          featured: Boolean(row.featured),
          active: row.active,
        }),
      )
    if (periods.dirty)
      await periods.save(
        (rows) =>
          rows.find((row) => !row.label.trim() || !row.id || row.months < 1)
            ? 'Cada período precisa de nome, código e meses.'
            : null,
        (row) => ({
          label: row.label.trim(),
          months: row.months,
          discount: row.discount,
          note: row.note?.trim() || null,
          active: row.active,
        }),
      )
  }

  return (
    <>
      <AdminHeader
        title="Clube"
        description="Planos e períodos da página do clube. A cobrança recorrente entra com o Mercado Pago."
        actions={
          <Button onClick={submit} disabled={saving || (!plans.dirty && !periods.dirty)}>
            {saving && <CircleNotch className="animate-spin" />} Salvar
          </Button>
        }
      />

      <h2 className="mb-3 font-display text-xl font-bold">Planos</h2>
      {!plans.rows ? (
        <div className="h-72 animate-pulse rounded-tile bg-background" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.rows.map((plan, index, all) => (
            <PlanCard
              key={index}
              plan={plan}
              isFirst={index === 0}
              isLast={index === all.length - 1}
              isNew={plans.isNew(plan.id)}
              onChange={(patch) => plans.update(index, patch)}
              onMove={(delta) => plans.move(index, delta)}
              onRemove={() => plans.remove(index)}
              onToggleFeatured={() =>
                all.forEach((_, position) =>
                  plans.update(position, { featured: position === index ? !plan.featured : false }),
                )
              }
            />
          ))}
          <button
            type="button"
            onClick={() => plans.add(newPlan(plans.rows?.length ?? 0))}
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-tile border-2 border-dashed text-sm font-semibold transition-colors hover:border-foreground hover:bg-background"
          >
            <Plus size={22} weight="bold" /> Novo plano
          </button>
        </div>
      )}

      <h2 className="mt-10 mb-3 font-display text-xl font-bold">Períodos</h2>
      <Panel className="p-0 md:p-0">
        {!periods.rows ? (
          <div className="h-40 animate-pulse rounded-tile" />
        ) : (
          <PeriodsTable
            rows={periods.rows}
            isNew={periods.isNew}
            onChange={periods.update}
            onMove={periods.move}
            onRemove={periods.remove}
          />
        )}
        <div className="border-t p-4">
          <Button variant="outline" onClick={() => periods.add(newPeriod(periods.rows?.length ?? 0))}>
            <Plus /> Adicionar período
          </Button>
        </div>
      </Panel>
    </>
  )
}
