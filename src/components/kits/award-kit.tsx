'use client'

import { Medal, ShoppingBagOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { BarPackage } from '@/components/product/bar-package'
import { useCart } from '@/components/cart/cart-provider'
import { AWARD_KIT, findBox, kitTotals } from '@/data/kits'
import { formatBRL, installment } from '@/data/products'

// Kit pronto com as barras premiadas
export function AwardKit() {
  const { addKit } = useCart()
  const { products, subtotal, total } = kitTotals(AWARD_KIT)
  const box = findBox(AWARD_KIT.box)

  return (
    <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-[#a9d8ef] p-6 md:p-10 lg:grid-cols-2">
      <div className="relative order-2 grid grid-cols-3 gap-2 lg:order-1">
        {products.map((product, index) => (
          <div key={product.slug} className="overflow-hidden rounded-2xl" style={{ background: product.tile, transform: `rotate(${(index % 3 - 1) * 3}deg)` }}>
            <BarPackage product={product} />
          </div>
        ))}
      </div>
      <div className="order-1 lg:order-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-background"><Medal size={16} weight="fill" /> Mais vendido</span>
        <h2 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em]">{AWARD_KIT.name}</h2>
        <p className="mt-4 max-w-md text-lg text-foreground/75">As barras que levaram a Kaê para Londres, Nova York e Paris, numa caixa com {box.size} barras pronta para presente.</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {products.map((product) => <li key={product.slug} className="rounded-full bg-background/80 px-3 py-1 text-sm font-semibold">{product.name} {product.cacao}%</li>)}
        </ul>
        <p className="mt-6 text-sm text-foreground/70"><s>{formatBRL(subtotal)}</s></p>
        <p className="font-display text-4xl font-extrabold">{formatBRL(total)}</p>
        <p className="text-sm text-foreground/70">ou 7x de {installment(total)} sem juros</p>
        <Button size="lg" className="mt-6" onClick={() => addKit(AWARD_KIT)}><ShoppingBagOpen weight="bold" /> Adicionar à sacola</Button>
      </div>
    </div>
  )
}
