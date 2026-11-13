import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { PackageArt } from './package/package-art'

type BarPackageProps = { product: Product; className?: string; priority?: boolean }

export function BarPackage({ product, className, priority }: BarPackageProps) {
  if (product.image) {
    return (
      <div className={cn('relative aspect-package', className)}>
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(max-width: 768px) 45vw, 20vw"
          priority={priority}
          className="object-contain"
        />
      </div>
    )
  }

  return (
    <div className={cn('relative grid aspect-package place-items-center', className)} aria-hidden="true">
      <PackageArt product={product} className="h-[88%] w-auto drop-shadow-package" />
    </div>
  )
}
