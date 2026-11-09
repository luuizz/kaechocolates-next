import * as React from 'react'
import { cn } from '@/lib/utils'

// Campos de formulário no padrão do site (mesmo foco do formulário de contato)
export const fieldClass =
  'h-12 w-full rounded-xl border bg-background px-4 text-base outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-foreground focus:ring-4 focus:ring-foreground/10 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-sm'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(fieldClass, className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldClass, 'h-auto resize-y py-3', className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn(fieldClass, 'pr-8', className)} {...props} />
}

// Rótulo + campo + ajuda/erro, já ligados por id para leitores de tela
export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string | null
  className?: string
  children: React.ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>
}) {
  const id = React.useId()
  const describedBy = error ? `${id}-erro` : hint ? `${id}-ajuda` : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {React.cloneElement(children, {
        id,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <span id={`${id}-erro`} className="text-xs text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-ajuda`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

// Aviso de erro/sucesso de formulário
export function FormMessage({ tone = 'error', children }: { tone?: 'error' | 'success'; children: React.ReactNode }) {
  if (!children) return null
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl px-4 py-3 text-sm',
        tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
      )}
    >
      {children}
    </p>
  )
}
