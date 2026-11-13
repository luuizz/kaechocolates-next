'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { planPrice } from '@/data/club'
import { useCatalog } from '@/components/catalog/catalog-provider'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'

export function PlanPicker() {
  const { plans, periods } = useCatalog()
  const [periodId, setPeriod] = useState(periods[0]?.id ?? '')
  const period = periods.find((item) => item.id === periodId) ?? periods[0]
  if (!period || !plans.length)
    return <p className="text-center text-muted-foreground">Os planos estão sendo atualizados. Volte em instantes.</p>

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Período da assinatura"
        className="mx-auto flex w-fit rounded-full border bg-secondary p-1"
      >
        {periods.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={period.id === option.id}
            onClick={() => setPeriod(option.id)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors md:px-5',
              period.id === option.id ? 'bg-foreground text-background' : 'hover:bg-background',
            )}
          >
            {option.label}
            {option.discount > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-2xs font-bold',
                  period.id === option.id ? 'bg-flavor-yellow text-foreground' : 'bg-success/15 text-success',
                )}
              >
                {option.note}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = planPrice(plan, period)
          const featured = Boolean(plan.featured)
          return (
            <article
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-card border-2 p-6 transition-colors md:p-8',
                featured ? 'border-foreground' : 'border-border',
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-foreground px-3 py-1 text-xs font-bold tracking-wider text-background uppercase">
                  Mais escolhido
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="grid grid-cols-3 gap-0.5" aria-hidden="true">
                  {Array.from({ length: Math.max(6, plan.bars) }, (_, index) => (
                    <span
                      key={index}
                      className="h-4 w-3 rounded-[2px]"
                      style={{ background: index < plan.bars ? plan.color : 'var(--border)' }}
                    />
                  ))}
                </span>
                <h3 className="font-display text-2xl font-extrabold">{plan.name}</h3>
              </div>
              <p className="mt-2 text-muted-foreground">{plan.pitch}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight">{formatBRL(price.monthly)}</span>
                <span className="text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {price.period.months > 1
                  ? `${formatBRL(price.total)} a cada ${price.period.months} meses`
                  : 'Cobrado todo mês'}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm">
                    <Check size={18} weight="bold" className="shrink-0 text-success" /> {perk}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant={featured ? 'default' : 'outline'} className="mt-8 w-full">
                <Link href={`/clube/assinar?plano=${plan.id}&periodo=${period.id}`}>Assinar {plan.name}</Link>
              </Button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
