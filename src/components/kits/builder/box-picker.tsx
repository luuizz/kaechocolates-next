'use client'

import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Box } from '@/types/kit'

type BoxPickerProps = { boxes: Box[]; boxId: string; onChange: (id: string) => void }

export function BoxPicker({ boxes, boxId, onChange: changeBox }: BoxPickerProps) {
  return (
    <>
      <h3 className="flex items-center gap-3 font-display text-2xl font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">1</span>{' '}
        Escolha a caixa
      </h3>
      <div role="radiogroup" aria-label="Tamanho da caixa" className="mt-5 grid gap-3 sm:grid-cols-3">
        {boxes.map((option) => {
          const active = option.id === boxId
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => changeBox(option.id)}
              className={cn(
                'relative rounded-2xl border-2 p-5 text-left transition-colors',
                active ? 'border-foreground bg-secondary' : 'hover:border-foreground/40',
              )}
            >
              {active && <Check size={18} weight="bold" className="absolute top-4 right-4" />}
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{option.note}</span>
              <span className="mt-1 block font-display text-xl font-extrabold">{option.name}</span>
              <span className="block text-sm">
                {option.size} barras ·{' '}
                <strong className="text-success">{Math.round(option.discount * 100)}% off</strong>
              </span>
              <span className="mt-3 grid grid-cols-9 gap-0.5" aria-hidden="true">
                {Array.from({ length: option.size }, (_, index) => (
                  <span key={index} className="aspect-3/4 rounded-[2px] bg-foreground/80" />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
