import Link from 'next/link'
import { BarPackage } from './bar-package'
import { AddToCartIcon } from '@/components/cart/add-to-cart'
import { formatBRL, installment, type Product } from '@/data/products'

// Cartão da vitrine: embalagem sobre a cor do sabor, preço e botão de comprar
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/produtos/${product.slug}`} className="relative block overflow-hidden rounded-2xl" style={{ background: product.tile }}>
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider">{product.badge}</span>
        )}
        {product.compareAt && !product.soldOut && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-foreground px-2.5 py-1 text-[0.68rem] font-bold text-background">
            -{Math.round((1 - product.price / product.compareAt) * 100)}%
          </span>
        )}
        <BarPackage product={product} className="transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:scale-[1.04]" />
        {product.soldOut && <span className="absolute inset-x-0 bottom-0 bg-foreground/85 py-2 text-center text-xs font-bold uppercase tracking-wider text-background">Esgotado</span>}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold leading-tight">
            <Link href={`/produtos/${product.slug}`} className="hover:underline">{product.name} {product.cacao}%</Link>
          </h3>
          <p className="mt-1 text-sm">
            {product.compareAt && <s className="mr-1.5 text-muted-foreground">{formatBRL(product.compareAt)}</s>}
            <strong>{formatBRL(product.price)}</strong>
          </p>
          <p className="text-xs text-muted-foreground">7x de {installment(product.price)} sem juros</p>
        </div>
        <AddToCartIcon slug={product.slug} name={product.name} disabled={product.soldOut} />
      </div>
    </article>
  )
}
