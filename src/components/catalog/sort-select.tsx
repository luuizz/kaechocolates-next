'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SORTS } from '@/constants/catalog'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const value = params.get('ordem') || 'relevancia'

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Ordenar por</span>
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params)
          if (event.target.value === 'relevancia') next.delete('ordem')
          else next.set('ordem', event.target.value)
          router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
        }}
        className="h-10 cursor-pointer rounded-full border bg-background pr-9 pl-4 font-semibold outline-none focus:border-foreground focus:ring-4 focus:ring-foreground/10"
      >
        {Object.entries(SORTS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
