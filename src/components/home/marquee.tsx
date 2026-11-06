import Image from 'next/image'
import { cn } from '@/lib/utils'

// Faixa que rola sem parar ("chocolate com axé e borogodó").
// O conteúdo vai duplicado e a animação anda 50%: o fim encaixa no começo.
export function Marquee({ items, className, invertIcon = true }: { items: string[]; className?: string; invertIcon?: boolean }) {
  const half = [...items, ...items, ...items]
  return (
    <div className={cn('overflow-hidden py-4', className)}>
      <p className="sr-only">{items.join(' · ')}</p>
      <div className="flex w-max animate-marquee items-center" aria-hidden="true">
        {[...half, ...half].map((text, index) => (
          <span key={index} className="flex items-center gap-8 pr-8 font-display text-2xl font-semibold uppercase italic md:text-3xl">
            {text}
            <Image src="/brand/simbolo.png" alt="" width={48} height={56} className={cn('h-7 w-auto', invertIcon && 'invert')} />
          </span>
        ))}
      </div>
    </div>
  )
}
