'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RowActionsProps = {
  /** vertical: subir/descer (tabelas); horizontal: esquerda/direita (cards) */
  direction?: 'vertical' | 'horizontal'
  isFirst: boolean
  isLast: boolean
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
  removeLabel: string
  className?: string
}

// Botões de reordenar e remover uma linha das listas editáveis do painel
export function RowActions({
  direction = 'vertical',
  isFirst,
  isLast,
  onMove,
  onRemove,
  removeLabel,
  className,
}: RowActionsProps) {
  const vertical = direction === 'vertical'
  return (
    <span className={cn('flex gap-0.5', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMove(-1)}
        disabled={isFirst}
        aria-label={vertical ? 'Subir' : 'Mover para a esquerda'}
      >
        {vertical ? <ArrowUp /> : <ArrowLeft />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMove(1)}
        disabled={isLast}
        aria-label={vertical ? 'Descer' : 'Mover para a direita'}
      >
        {vertical ? <ArrowDown /> : <ArrowRight />}
      </Button>
      <Button variant="ghost" size="icon" className="text-destructive" onClick={onRemove} aria-label={removeLabel}>
        <Trash />
      </Button>
    </span>
  )
}
