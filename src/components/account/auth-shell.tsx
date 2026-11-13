import Link from 'next/link'
import { BarPackage } from '@/components/product/bar-package'
import type { Product } from '@/types/product'

export function AuthShell({
  title,
  description,
  products,
  children,
  footer,
}: {
  title: string
  description?: string
  products: Product[]
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const bars = products.filter((product) => !product.soldOut).slice(0, 3)
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Início
          </Link>{' '}
          <span aria-hidden="true">/</span> <span className="text-foreground">{title}</span>
        </nav>
        <h1 className="mt-4 font-display text-4xl leading-display font-extrabold tracking-display md:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
      </div>
      <div
        className="relative hidden min-h-[32rem] overflow-hidden rounded-hero bg-flavor-yellow lg:block"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/25" />
        {bars.map((product, index) => (
          <div
            key={product.slug}
            className="absolute top-1/2 left-1/2 w-52"
            style={{
              transform: `translate(calc(-50% + ${(index - 1) * 110}px), calc(-50% + ${Math.abs(index - 1) * 26}px)) rotate(${(index - 1) * 12}deg)`,
              zIndex: index === 1 ? 2 : 1,
            }}
          >
            <BarPackage product={product} />
          </div>
        ))}
        <p className="absolute right-8 bottom-8 left-8 font-display text-3xl leading-tight font-extrabold tracking-heading">
          Seus pedidos, endereços e o clube num lugar só.
        </p>
      </div>
    </div>
  )
}
