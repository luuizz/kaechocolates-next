'use client'

import { useState } from 'react'
import { Check, LockSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { PERIODS, PLANS, planPrice, type PeriodId, type PlanId } from '@/data/club'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'

// Escolha de plano e período, com o preço por mês e o total do período
export function PlanPicker() {
  const [period, setPeriod] = useState<PeriodId>('mensal')
  const [chosen, setChosen] = useState<PlanId | null>(null)

  return (
    <div>
      <div role="radiogroup" aria-label="Período da assinatura" className="mx-auto flex w-fit rounded-full border bg-secondary p-1">
        {PERIODS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={period === option.id}
            onClick={() => setPeriod(option.id)}
            className={cn('flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors md:px-5', period === option.id ? 'bg-foreground text-background' : 'hover:bg-background')}
          >
            {option.label}
            {option.discount > 0 && <span className={cn('rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold', period === option.id ? 'bg-flavor-yellow text-foreground' : 'bg-success/15 text-success')}>{option.note}</span>}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = planPrice(plan.id, period)
          const featured = 'featured' in plan && plan.featured
          const selected = chosen === plan.id
          return (
            <article key={plan.id} className={cn('relative flex flex-col rounded-[1.75rem] border-2 p-6 transition-colors md:p-8', featured ? 'border-foreground' : 'border-border', selected && 'ring-4 ring-flavor-yellow')}>
              {featured && <span className="absolute -top-3 left-6 rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-background">Mais escolhido</span>}
              <div className="flex items-center gap-3">
                <span className="grid grid-cols-3 gap-0.5" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => <span key={index} className="h-4 w-3 rounded-[2px]" style={{ background: index < plan.bars ? plan.color : 'var(--border)' }} />)}
                </span>
                <h3 className="font-display text-2xl font-extrabold">{plan.name}</h3>
              </div>
              <p className="mt-2 text-muted-foreground">{plan.pitch}</p>
              <p className="mt-6 flex items-baseline gap-1"><span className="font-display text-4xl font-extrabold tracking-tight">{formatBRL(price.monthly)}</span><span className="text-muted-foreground">/mês</span></p>
              <p className="text-sm text-muted-foreground">{price.period.months > 1 ? `${formatBRL(price.total)} a cada ${price.period.months} meses` : 'Cobrado todo mês'}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.perks.map((perk) => <li key={perk} className="flex items-center gap-2 text-sm"><Check size={18} weight="bold" className="shrink-0 text-success" /> {perk}</li>)}
              </ul>
              <Button size="lg" variant={featured ? 'default' : 'outline'} className="mt-8 w-full" onClick={() => setChosen(plan.id)} aria-pressed={selected}>
                {selected ? 'Plano escolhido' : `Assinar ${plan.name}`}
              </Button>
            </article>
          )
        })}
      </div>

      {chosen && (
        <div role="status" className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl bg-secondary p-5 text-sm">
          <LockSimple size={22} weight="duotone" className="shrink-0" />
          <p>
            Ótima escolha: <strong>{PLANS.find((plan) => plan.id === chosen)!.name}</strong>, {PERIODS.find((item) => item.id === period)!.label.toLowerCase()}. As assinaturas abrem assim que o pagamento recorrente pelo Mercado Pago estiver no ar.
          </p>
        </div>
      )}
    </div>
  )
}
