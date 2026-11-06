'use client'

import { useState } from 'react'
import { ShoppingBagOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { QuantityStepper } from '@/components/cart/quantity-stepper'
import { useCart, MAX_PER_ITEM } from '@/components/cart/cart-provider'
import { formatBRL, type Product } from '@/data/products'

// Quantidade + adicionar à sacola na página do produto
export function BuyBox({ product }: { product: Product }) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (product.soldOut) {
    return <p className="rounded-2xl bg-secondary px-5 py-4 font-semibold">Esgotado no momento. Edições limitadas voltam só de vez em quando.</p>
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <QuantityStepper value={quantity} max={MAX_PER_ITEM} onChange={setQuantity} />
      <Button size="lg" className="flex-1" onClick={() => add(product.slug, quantity)}>
        <ShoppingBagOpen weight="bold" /> Adicionar à sacola · {formatBRL(product.price * quantity)}
      </Button>
    </div>
  )
}
