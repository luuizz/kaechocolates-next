'use client'

import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
  label = 'Quantidade',
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  label?: string
}) {
  const box = size === 'sm' ? 'h-9' : 'h-12'
  const btn = size === 'sm' ? 'w-8' : 'w-11'
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex items-center rounded-full border bg-background', box)}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir"
        className={cn('grid h-full place-items-center rounded-l-full hover:bg-secondary disabled:opacity-30', btn)}
      >
        <Minus size={14} weight="bold" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
        className={cn('grid h-full place-items-center rounded-r-full hover:bg-secondary disabled:opacity-30', btn)}
      >
        <Plus size={14} weight="bold" />
      </button>
    </div>
  )
}
