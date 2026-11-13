'use client'

import { useId, useState } from 'react'
import { Input } from '@/components/ui/field'

type ColorFieldProps = { label: string; value: string; onChange: (value: string) => void }

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [textValue, setTextValue] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setTextValue(value)
  }
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} (seletor)`}
          className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border bg-background p-1"
        />
        <Input
          id={id}
          value={textValue}
          onChange={(event) => {
            const next = event.target.value.trim()
            setTextValue(next)
            if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next.toLowerCase())
          }}
          maxLength={7}
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}
