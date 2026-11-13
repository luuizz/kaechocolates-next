'use client'

import { Plus } from '@phosphor-icons/react'
import { useCart } from './cart-provider'

export function AddToCartIcon({ slug, name, disabled }: { slug: string; name: string; disabled?: boolean }) {
  const { add } = useCart()
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => add(slug)}
      aria-label={`Adicionar ${name} à sacola`}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
    >
      <Plus size={18} weight="bold" />
    </button>
  )
}
