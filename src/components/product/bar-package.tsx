import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

// Tamanhos em cqw: escalam com a largura do próprio componente
export function BarPackage({
  product,
  className,
  priority,
}: {
  product: Product
  className?: string
  priority?: boolean
}) {
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

  const light = product.labelText === 'light'
  return (
    <div className={cn('@container relative aspect-package', className)} aria-hidden="true">
      <div className="absolute inset-x-[22%] inset-y-[8%] flex flex-col items-center rounded-[2.5cqw] bg-paper px-[4cqw] pt-[3cqw] shadow-[-2cqw_3cqw_5cqw_rgba(17,17,17,0.3)]">
        <div
          className="absolute inset-x-[16%] top-0 h-[1.6cqw] rounded-b-[1cqw]"
          style={{ background: product.label }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="" className="mt-[3.5cqw] w-[44%]" />
        <div
          className="mt-[5cqw] flex w-full flex-col items-center rounded-[1.4cqw] px-[2cqw] pt-[3.5cqw] pb-[3cqw] text-center"
          style={{ background: product.label, color: light ? '#fff' : '#1d1d1b' }}
        >
          <span className="font-display text-[5.6cqw] leading-[1.05] font-extrabold">{product.name}</span>
          <span className="font-display text-[21cqw] leading-display font-extrabold tracking-[-0.04em]">
            {product.cacao}
          </span>
          <span className="mt-[1cqw] text-[1.6cqw] font-semibold tracking-[0.1em] uppercase">
            {product.cacao}% de cacau
          </span>
        </div>
        <span className="mt-[3cqw] text-[1.6cqw] tracking-[0.1em] text-ink/70 uppercase">Bahia, Brasil</span>
        <span className="mt-[5cqw] flex gap-[2.4cqw]">
          {[0, 1, 2].map((index) => (
            <span key={index} className="size-[4cqw] rounded-full border-[0.35cqw] border-ink/60" />
          ))}
        </span>
        <span className="absolute bottom-[3cqw] text-[1.8cqw] font-bold text-ink">{product.weight} | 2.4 oz</span>
      </div>
    </div>
  )
}
