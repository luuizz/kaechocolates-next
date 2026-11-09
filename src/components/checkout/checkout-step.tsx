import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type CheckoutStepProps = { number: number; title: string; icon: Icon; muted?: boolean; children: React.ReactNode }

export function CheckoutStep({ number, title, icon: StepIcon, muted, children }: CheckoutStepProps) {
  return (
    <section
      aria-labelledby={`passo-${number}`}
      className={cn('rounded-card border p-5 transition-opacity md:p-7', muted && 'opacity-60')}
    >
      <h2 id={`passo-${number}`} className="mb-5 flex items-center gap-3 font-display text-xl font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm text-background">
          {number}
        </span>
        {title}
        <StepIcon size={20} className="ml-auto text-muted-foreground" />
      </h2>
      {children}
    </section>
  )
}
