import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const emptyVariants = cva('flex flex-col items-center text-center', {
  variants: {
    size: {
      page: 'mx-auto max-w-xl gap-4 px-5 py-28',
      compact: 'flex-1 justify-center gap-4 px-8',
      panel: 'gap-2 rounded-[1.75rem] border border-dashed px-6 py-14',
    },
  },
  defaultVariants: { size: 'page' },
})

const iconVariants = cva('grid place-items-center rounded-full bg-secondary', {
  variants: { size: { page: 'size-24', compact: 'size-20', panel: 'mb-2 size-14' } },
  defaultVariants: { size: 'page' },
})

type EmptyStateProps = VariantProps<typeof emptyVariants> & {
  icon: React.ReactNode
  title: string
  description?: string
  /** h1 quando o estado vazio é a página inteira */
  titleAs?: 'h1' | 'h2' | 'p'
  action?: React.ReactNode
  className?: string
}

// Estado vazio de lista ou página: ícone, título, texto e uma ação
export function EmptyState({ icon, title, description, titleAs: Title = 'h1', action, size, className }: EmptyStateProps) {
  return (
    <div className={cn(emptyVariants({ size }), className)}>
      <span className={iconVariants({ size })}>{icon}</span>
      <Title className={cn('font-display font-extrabold', size === 'page' || !size ? 'text-4xl' : 'text-xl font-bold')}>{title}</Title>
      {description && <p className={cn('text-muted-foreground', size !== 'page' && size && 'max-w-sm text-sm')}>{description}</p>}
      {action && (size === 'panel' ? <div className="mt-4">{action}</div> : action)}
    </div>
  )
}
