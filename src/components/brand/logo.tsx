import Image from 'next/image'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Image
      src={inverted ? brand.logo.inverted : brand.logo.src}
      alt={brand.logo.alt}
      width={186}
      height={94}
      priority
      unoptimized
      className={cn('h-11 w-auto', className)}
    />
  )
}
