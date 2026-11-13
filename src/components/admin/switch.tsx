'use client'

import { cn } from '@/lib/utils'

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  tone = 'success',
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  tone?: 'success' | 'danger'
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-4 focus-visible:ring-foreground/15 disabled:opacity-50',
        checked ? (tone === 'danger' ? 'bg-destructive' : 'bg-success') : 'bg-input',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
