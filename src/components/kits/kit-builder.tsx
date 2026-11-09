'use client'

import { useMemo, useState } from 'react'
import { ArrowCounterClockwise, Check, Minus, Plus, Shuffle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { BarPackage } from '@/components/product/bar-package'
import { useCart } from '@/components/cart/cart-provider'
import { useCatalog } from '@/components/catalog/catalog-provider'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'

const MESSAGE_MAX = 200

// Montador de kit: escolhe a caixa, as barras e o recado do cartão
export function KitBuilder() {
  const { addKit } = useCart()
  const { products, boxes, findBox, kitTotals } = useCatalog()
  const available = useMemo(() => products.filter((product) => !product.soldOut), [products])
  const [boxId, setBoxId] = useState(() => (boxes.find((item) => item.id === 'm') ?? boxes[0])?.id ?? '')
  const [picked, setPicked] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [added, setAdded] = useState(false)

  const box = findBox(boxId) ?? { id: '', name: 'Caixa', size: 0, discount: 0 }
  const full = box.size > 0 && picked.length === box.size
  const totals = useMemo(() => kitTotals({ box: boxId, slugs: picked }), [boxId, picked, kitTotals])
  const countOf = (slug: string) => picked.filter((item) => item === slug).length

  const changeBox = (id: string) => {
    setBoxId(id)
    setPicked((current) => current.slice(0, findBox(id)?.size ?? 0))
  }
  const plus = (slug: string) => {
    if (!full) {
      setPicked((current) => [...current, slug])
      setAdded(false)
    }
  }
  const minus = (slug: string) => {
    setPicked((current) => {
      const index = current.lastIndexOf(slug)
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)]
    })
    setAdded(false)
  }
  const surprise = () => {
    const missing = box.size - picked.length
    const extra = Array.from({ length: missing }).flatMap(
      () => available[Math.floor(Math.random() * available.length)]?.slug ?? [],
    )
    setPicked((current) => [...current, ...extra])
  }
  const submit = () => {
    addKit({
      name: `Kit ${box.name.replace('Caixa ', '')} montado por você`,
      box: boxId,
      slugs: picked,
      message: message.trim() || undefined,
    })
    setAdded(true)
    setPicked([])
    setMessage('')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        {/* 1. Caixa */}
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

        {/* 2. Barras */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
          <h3 className="flex items-center gap-3 font-display text-2xl font-extrabold">
            <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">2</span>{' '}
            Escolha as barras
          </h3>
          <p className="text-sm text-muted-foreground">Pode repetir o sabor que quiser.</p>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {available.map((product) => {
            const count = countOf(product.slug)
            return (
              <li
                key={product.slug}
                className={cn(
                  'overflow-hidden rounded-2xl border-2 transition-colors',
                  count ? 'border-foreground' : 'border-transparent',
                )}
              >
                <div className="relative" style={{ background: product.tile }}>
                  <BarPackage product={product} />
                  {count > 0 && (
                    <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 bg-card p-2.5">
                  <span className="text-sm leading-tight font-bold">
                    {product.name} {product.cacao}%
                  </span>
                  <span className="flex items-center justify-between gap-1">
                    <span className="text-xs text-muted-foreground">{formatBRL(product.price)}</span>
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => minus(product.slug)}
                        disabled={!count}
                        aria-label={`Tirar ${product.name}`}
                        className="grid size-8 place-items-center rounded-full border disabled:opacity-30"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => plus(product.slug)}
                        disabled={full}
                        aria-label={`Colocar ${product.name}`}
                        className="grid size-8 place-items-center rounded-full bg-foreground text-background disabled:opacity-30"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </span>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 3. Resumo */}
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
              onClick={() => setPicked([])}
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
    </div>
  )
}
