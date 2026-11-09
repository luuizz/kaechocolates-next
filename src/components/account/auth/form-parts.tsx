'use client'

import { useState } from 'react'
import { CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react'
import { Field, Input } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

// Só volta para caminhos internos (evita redirecionar para outro site)
export function safeNext(value: string | null, fallback = '/conta') {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
        className="absolute top-1.5 right-1.5 grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

// Field passa id/aria para o filho direto; aqui o filho é o wrapper do campo de senha
export function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  autoComplete: string
  hint?: string
}) {
  return (
    <Field label={label} error={error} hint={hint}>
      <PasswordInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
      />
    </Field>
  )
}

export function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={busy}>
      {busy && <CircleNotch className="animate-spin" weight="bold" />} {children}
    </Button>
  )
}
