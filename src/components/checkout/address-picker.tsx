'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, Plus } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { AddressForm } from '@/components/account/address-form'
import { emptyAddress, formatCep } from '@/lib/address'
import { FormMessage } from '@/components/ui/field'
import { getNeon, unwrap } from '@/lib/neon'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/account'

export function AddressPicker({
  value,
  onChange,
  label = 'Endereço de entrega',
}: {
  value: Address | null
  onChange: (address: Address | null) => void
  label?: string
}) {
  const auth = useAuth()
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (select?: number) => {
    const rows = unwrap(
      await getNeon().from('addresses').select('*').order('is_default', { ascending: false }).order('id'),
    ) as Address[]
    setAddresses(rows)
    if (!rows.length) setAdding(true)
    onChange(rows.find((item) => item.id === select) ?? rows[0] ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onChange do pai muda a cada render
  }, [])

  useEffect(() => {
    if (!auth.user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial dos endereços
    load().catch((err) => setError(err.message))
  }, [auth.user, load])

  if (error) return <FormMessage>{error}</FormMessage>
  if (addresses === null) return <div className="h-24 animate-pulse rounded-2xl bg-secondary" />

  if (adding) {
    return (
      <AddressForm
        draft={{ ...emptyAddress(auth.profile?.full_name ?? ''), is_default: addresses.length === 0 }}
        onCancel={() => setAdding(false)}
        onSaved={async (id) => {
          setAdding(false)
          await load(id || undefined)
        }}
      />
    )
  }

  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3 md:grid-cols-2">
      {addresses.map((item) => {
        const active = item.id === value?.id
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item)}
            className={cn(
              'relative rounded-2xl border-2 p-4 text-left text-sm transition-colors',
              active ? 'border-foreground bg-secondary' : 'hover:border-foreground/40',
            )}
          >
            {active && <CheckCircle size={20} weight="fill" className="absolute top-3 right-3" />}
            <span className="block font-semibold">{item.label || item.recipient}</span>
            <span className="mt-1 block text-muted-foreground">
              {item.street}, {item.number}
              {item.complement ? ` · ${item.complement}` : ''}
            </span>
            <span className="block text-muted-foreground">
              {item.district} · {item.city}/{item.state} · {formatCep(item.cep)}
            </span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex min-h-24 items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-semibold hover:border-foreground hover:bg-secondary"
      >
        <Plus weight="bold" /> Novo endereço
      </button>
    </div>
  )
}
