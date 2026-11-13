import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const loaderVariants = cva('grid place-items-center', {
  variants: {
    height: {
      section: 'min-h-40',
      panel: 'min-h-80',
      page: 'min-h-[60vh]',
      screen: 'min-h-dvh',
    },
  },
  defaultVariants: { height: 'panel' },
})

type PageLoaderProps = VariantProps<typeof loaderVariants> & { className?: string }

export function PageLoader({ height, className }: PageLoaderProps) {
  return (
    <div className={cn(loaderVariants({ height }), className)}>
      <CircleNotch
        size={height === 'section' ? 28 : 32}
        className="animate-spin text-muted-foreground"
        aria-label="Carregando"
      />
    </div>
  )
}
