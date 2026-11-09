'use client'

import { Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { cn, slugify } from '@/lib/utils'
import { Panel } from '../admin-shell'
import { RowActions } from '../row-actions'
import { Switch } from '../switch'
import type { AdminPlan } from '@/types/club'

const money = (value: string) => Number(value.replace(/\./g, '').replace(',', '.')) || 0

type PlanCardProps = {
  plan: AdminPlan
  isFirst: boolean
  isLast: boolean
  isNew: boolean
  onChange: (patch: Partial<AdminPlan>) => void
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
  onToggleFeatured: () => void
}

export function PlanCard({
  plan,
  isFirst,
  isLast,
  isNew,
  onChange,
  onMove,
  onRemove,
  onToggleFeatured,
}: PlanCardProps) {
  return (
    <Panel
      className={cn(
        'flex flex-col gap-3 border-2',
        plan.featured ? 'border-foreground' : 'border-transparent',
        !plan.active && 'opacity-70',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={plan.color}
            onChange={(event) => onChange({ color: event.target.value })}
            aria-label="Cor do plano"
            className="size-9 cursor-pointer rounded-lg border p-0.5"
          />
          <span className="text-xs text-muted-foreground">{formatBRL(plan.price)}/mês</span>
        </span>
        <RowActions
          direction="horizontal"
          isFirst={isFirst}
          isLast={isLast}
          onMove={onMove}
          onRemove={onRemove}
          removeLabel={`Remover ${plan.name}`}
        />
      </div>
      <div className="grid grid-cols-[1fr_8.5rem] gap-3">
        <Field label="Nome">
          <Input value={plan.name} onChange={(event) => onChange({ name: event.target.value })} />
        </Field>
        <Field label="Código">
          <Input
            value={plan.id}
            disabled={!isNew}
            onChange={(event) => onChange({ id: slugify(event.target.value) })}
            className="px-3 font-mono text-xs md:text-xs"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Barras/mês">
          <Input
            value={plan.bars || ''}
            onChange={(event) => onChange({ bars: Math.min(24, Number(event.target.value.replace(/\D/g, '')) || 0) })}
            inputMode="numeric"
          />
        </Field>
        <Field label="Preço/mês (R$)">
          <Input
            key={`${plan.id}-${plan.price}`}
            defaultValue={plan.price ? plan.price.toFixed(2).replace('.', ',') : ''}
            onBlur={(event) => onChange({ price: money(event.target.value) })}
            inputMode="decimal"
          />
        </Field>
      </div>
      <Field label="Chamada">
        <Input value={plan.pitch} onChange={(event) => onChange({ pitch: event.target.value })} />
      </Field>
      <Field label="Benefícios" hint="Um por linha.">
        <Textarea
          value={plan.perks.join('\n')}
          onChange={(event) => onChange({ perks: event.target.value.split('\n') })}
          rows={5}
        />
      </Field>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm font-semibold">
        <label className="flex items-center gap-2">
          <Switch checked={plan.active} onChange={(active) => onChange({ active })} label={`${plan.name} ativo`} />{' '}
          Ativo
        </label>
        <Button
          variant={plan.featured ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFeatured}
          aria-pressed={Boolean(plan.featured)}
        >
          <Star weight={plan.featured ? 'fill' : 'regular'} /> Destaque
        </Button>
      </div>
    </Panel>
  )
}
