'use client'

import { ArrowCounterClockwise, Shuffle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'
import type { useKitBuilder } from './use-kit-builder'

const MESSAGE_MAX = 200

type KitSummaryProps = Pick<
  ReturnType<typeof useKitBuilder>,
  'box' | 'picked' | 'full' | 'totals' | 'message' | 'setMessage' | 'added' | 'surprise' | 'clear' | 'submit'
>

export function KitSummary({
  box,
  picked,
  full,
  totals,
  message,
  setMessage,
  added,
  surprise,
  clear,
  submit,
}: KitSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-36 lg:self-start">
      <div className="rounded-card bg-foreground p-6 text-background">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-2xl font-extrabold">Sua caixa</h3>
          <span className="text-sm text-background/70" aria-live="polite">
            {picked.length} de {box.size}
          </span>
        </div>
        <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Barras na caixa">
          {Array.from({ length: box.size }, (_, index) => {
            const product = totals.products[index]
            return (
              <li
                key={index}
                className={cn(
                  'grid aspect-3/4 place-items-center rounded-lg border border-dashed border-background/25 p-1 text-center transition-all duration-300',
                  product && 'scale-100 border-solid border-transparent',
                )}
                style={
                  product
                    ? { background: product.label, color: product.labelText === 'light' ? '#fff' : '#111' }
                    : undefined
                }
              >
                {product ? (
                  <span className="flex flex-col leading-none">
                    <span className="font-display text-2xl font-extrabold">{product.cacao}</span>
                    <span className="mt-1 text-[0.6rem] font-bold uppercase">{product.name}</span>
                  </span>
                ) : (
                  <span className="text-xs text-background/40">{index + 1}</span>
                )}
              </li>
            )
          })}
        </ol>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={surprise}
            disabled={full}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-background/25 text-xs font-bold hover:bg-background/10 disabled:opacity-30"
          >
            <Shuffle size={16} /> Completar com surpresa
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!picked.length}
            aria-label="Esvaziar caixa"
            className="grid size-9 place-items-center rounded-full border border-background/25 hover:bg-background/10 disabled:opacity-30"
          >
            <ArrowCounterClockwise size={16} />
          </button>
        </div>

        <label className="mt-6 block text-sm font-bold" htmlFor="kit-message">
          Recado no cartão <span className="font-normal text-background/60">(opcional)</span>
        </label>
        <textarea
          id="kit-message"
          value={message}
          maxLength={MESSAGE_MAX}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Escrevemos à mão para você."
          className="mt-2 w-full resize-none rounded-xl border border-background/20 bg-background/5 p-3 text-sm outline-none placeholder:text-background/40 focus:border-flavor-yellow focus:ring-4 focus:ring-flavor-yellow/20"
        />
        <p className="text-right text-xs text-background/50">
          {message.length}/{MESSAGE_MAX}
        </p>

        <dl className="mt-4 flex flex-col gap-1.5 border-t border-background/15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-background/70">Barras</dt>
            <dd>{formatBRL(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-flavor-yellow">
            <dt>Desconto da caixa ({Math.round(box.discount * 100)}%)</dt>
            <dd>-{formatBRL(totals.discount)}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <dt className="font-bold">Total do kit</dt>
            <dd className="font-display text-3xl font-extrabold">{formatBRL(totals.total)}</dd>
          </div>
        </dl>
        <Button variant="accent" size="lg" className="mt-5 w-full" disabled={!full} onClick={submit}>
          {full
            ? 'Adicionar kit à sacola'
            : `Faltam ${box.size - picked.length} ${box.size - picked.length === 1 ? 'barra' : 'barras'}`}
        </Button>
        {added && (
          <p className="mt-3 text-center text-sm text-flavor-yellow" role="status">
            Kit adicionado à sacola!
          </p>
        )}
      </div>
    </aside>
  )
}
