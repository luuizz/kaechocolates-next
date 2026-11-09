'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CircleNotch, Plus, Star, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { listPeriods, listPlans } from '@/lib/admin-api'
import { cn, slugify } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'
import { fromPercent, percent, useListEditor } from './list-editor'
import { Switch } from './switch'
import type { AdminPeriod, AdminPlan } from '@/types/club'

const money = (value: string) => Number(value.replace(/\./g, '').replace(',', '.')) || 0

export function ClubEditor() {
  const plans = useListEditor<AdminPlan>('club_plans', listPlans)
  const periods = useListEditor<AdminPeriod>('club_periods', listPeriods)
  const saving = plans.saving || periods.saving

  const submit = async () => {
    if (plans.dirty) await plans.save(
      (rows) => rows.find((row) => !row.name.trim() || !row.id || row.bars < 1 || !(row.price > 0)) ? 'Cada plano precisa de nome, código, barras e preço.' : null,
      (row) => ({ name: row.name.trim(), bars: row.bars, price: row.price, color: row.color, pitch: row.pitch.trim(), perks: row.perks.map((perk) => perk.trim()).filter(Boolean), featured: Boolean(row.featured), active: row.active }),
    )
    if (periods.dirty) await periods.save(
      (rows) => rows.find((row) => !row.label.trim() || !row.id || row.months < 1) ? 'Cada período precisa de nome, código e meses.' : null,
      (row) => ({ label: row.label.trim(), months: row.months, discount: row.discount, note: row.note?.trim() || null, active: row.active }),
    )
  }

  return (
    <>
      <AdminHeader
        title="Clube"
        description="Planos e períodos da página do clube. A cobrança recorrente entra com o Mercado Pago."
        actions={<Button onClick={submit} disabled={saving || (!plans.dirty && !periods.dirty)}>{saving && <CircleNotch className="animate-spin" />} Salvar</Button>}
      />

      <h2 className="mb-3 font-display text-xl font-bold">Planos</h2>
      {!plans.rows ? (
        <div className="h-72 animate-pulse rounded-tile bg-background" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.rows.map((plan, index) => (
            <Panel key={index} className={cn('flex flex-col gap-3 border-2', plan.featured ? 'border-foreground' : 'border-transparent', !plan.active && 'opacity-70')}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input type="color" value={plan.color} onChange={(event) => plans.update(index, { color: event.target.value })} aria-label="Cor do plano" className="size-9 cursor-pointer rounded-lg border p-0.5" />
                  <span className="text-xs text-muted-foreground">{formatBRL(plan.price)}/mês</span>
                </span>
                <span className="flex gap-0.5">
                  <Button variant="ghost" size="icon" onClick={() => plans.move(index, -1)} disabled={index === 0} aria-label="Mover para a esquerda"><ArrowLeft /></Button>
                  <Button variant="ghost" size="icon" onClick={() => plans.move(index, 1)} disabled={index === plans.rows!.length - 1} aria-label="Mover para a direita"><ArrowRight /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => plans.remove(index)} aria-label={`Remover ${plan.name}`}><Trash /></Button>
                </span>
              </div>
              <div className="grid grid-cols-[1fr_8.5rem] gap-3">
                <Field label="Nome"><Input value={plan.name} onChange={(event) => plans.update(index, { name: event.target.value })} /></Field>
                <Field label="Código"><Input value={plan.id} disabled={!plans.isNew(plan.id)} onChange={(event) => plans.update(index, { id: slugify(event.target.value) })} className="px-3 font-mono text-xs md:text-xs" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Barras/mês"><Input value={plan.bars || ''} onChange={(event) => plans.update(index, { bars: Math.min(24, Number(event.target.value.replace(/\D/g, '')) || 0) })} inputMode="numeric" /></Field>
                <Field label="Preço/mês (R$)"><Input key={`${plan.id}-${index}-${plan.price}`} defaultValue={plan.price ? plan.price.toFixed(2).replace('.', ',') : ''} onBlur={(event) => plans.update(index, { price: money(event.target.value) })} inputMode="decimal" /></Field>
              </div>
              <Field label="Chamada"><Input value={plan.pitch} onChange={(event) => plans.update(index, { pitch: event.target.value })} /></Field>
              <Field label="Benefícios" hint="Um por linha."><Textarea value={plan.perks.join('\n')} onChange={(event) => plans.update(index, { perks: event.target.value.split('\n') })} rows={5} /></Field>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm font-semibold">
                <label className="flex items-center gap-2"><Switch checked={plan.active} onChange={(active) => plans.update(index, { active })} label={`${plan.name} ativo`} /> Ativo</label>
                <Button variant={plan.featured ? 'default' : 'outline'} size="sm" onClick={() => plans.rows!.forEach((_, position) => plans.update(position, { featured: position === index ? !plan.featured : false }))} aria-pressed={Boolean(plan.featured)}>
                  <Star weight={plan.featured ? 'fill' : 'regular'} /> Destaque
                </Button>
              </div>
            </Panel>
          ))}
          <button type="button" onClick={() => plans.add({ id: `plano-${(plans.rows?.length ?? 0) + 1}`, name: 'Novo plano', bars: 3, price: 89.9, color: '#5fc2b0', pitch: '', perks: ['Frete grátis'], featured: false, active: false, sort_order: 0 })} className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-tile border-2 border-dashed text-sm font-semibold transition-colors hover:border-foreground hover:bg-background">
            <Plus size={22} weight="bold" /> Novo plano
          </button>
        </div>
      )}

      <h2 className="mb-3 mt-10 font-display text-xl font-bold">Períodos</h2>
      <Panel className="p-0 md:p-0">
        {!periods.rows ? (
          <div className="h-40 animate-pulse rounded-tile" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Nome</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Código</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Meses</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Desconto (%)</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Selo</th>
                  <th scope="col" className="px-2 py-3 text-center font-semibold">Ativo</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Ordem e remover</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.rows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-5 py-2.5"><Input value={row.label} onChange={(event) => periods.update(index, { label: event.target.value })} aria-label="Nome do período" className="h-10 min-w-32" /></td>
                    <td className="px-2 py-2.5"><Input value={row.id} disabled={!periods.isNew(row.id)} onChange={(event) => periods.update(index, { id: slugify(event.target.value) })} aria-label="Código" className="h-10 w-32 font-mono" /></td>
                    <td className="px-2 py-2.5"><Input value={row.months || ''} onChange={(event) => periods.update(index, { months: Math.min(12, Number(event.target.value.replace(/\D/g, '')) || 0) })} inputMode="numeric" aria-label="Meses" className="h-10 w-20" /></td>
                    <td className="px-2 py-2.5"><Input key={`${row.id}-${index}-${row.discount}`} defaultValue={percent(row.discount)} onBlur={(event) => periods.update(index, { discount: fromPercent(event.target.value) })} inputMode="decimal" aria-label="Desconto em %" className="h-10 w-24" /></td>
                    <td className="px-2 py-2.5"><Input value={row.note ?? ''} onChange={(event) => periods.update(index, { note: event.target.value })} aria-label="Selo" className="h-10 min-w-36" placeholder="10% off" /></td>
                    <td className="px-2 py-2.5 text-center"><Switch checked={row.active} onChange={(active) => periods.update(index, { active })} label={`${row.label} ativo`} /></td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => periods.move(index, -1)} disabled={index === 0} aria-label="Subir"><ArrowUp /></Button>
                        <Button variant="ghost" size="icon" onClick={() => periods.move(index, 1)} disabled={index === periods.rows!.length - 1} aria-label="Descer"><ArrowDown /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => periods.remove(index)} aria-label={`Remover ${row.label}`}><Trash /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t p-4">
          <Button variant="outline" onClick={() => periods.add({ id: `periodo-${(periods.rows?.length ?? 0) + 1}`, label: 'Anual', months: 12, discount: 0.15, note: '15% off', active: false, sort_order: 0 })}><Plus /> Adicionar período</Button>
        </div>
      </Panel>
    </>
  )
}
