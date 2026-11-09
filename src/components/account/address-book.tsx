'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { FormMessage } from '@/components/ui/field'
import { PageLoader } from '@/components/ui/page-loader'
import { emptyAddress } from '@/lib/address'
import { getNeon, unwrap } from '@/lib/neon'
import { AddressCard } from './address-card'
import { AddressForm } from './address-form'
import type { Address, AddressDraft } from '@/types/account'

const message = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export function AddressBook() {
  const auth = useAuth()
  const [list, setList] = useState<Address[] | null>(null)
  const [draft, setDraft] = useState<AddressDraft | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const rows = unwrap(
        await getNeon().from('addresses').select('*').order('is_default', { ascending: false }).order('id'),
      ) as Address[]
      setList(rows)
    } catch (err) {
      setError(message(err, 'Não foi possível carregar os endereços.'))
      setList([])
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial
    load()
  }, [load])

  const remove = async (address: Address) => {
    if (!window.confirm(`Remover o endereço ${address.label || address.street}?`)) return
    try {
      unwrap(await getNeon().from('addresses').delete().eq('id', address.id))
      await load()
    } catch (err) {
      setError(message(err, 'Não foi possível remover.'))
    }
  }

  const makeDefault = async (address: Address) => {
    try {
      unwrap(await getNeon().from('addresses').update({ is_default: false }).eq('is_default', true))
      unwrap(await getNeon().from('addresses').update({ is_default: true }).eq('id', address.id))
      await load()
    } catch (err) {
      setError(message(err, 'Não foi possível atualizar.'))
    }
  }

  if (draft) {
    const saved = async () => {
      setDraft(null)
      await load()
    }
    return <AddressForm draft={draft} onCancel={() => setDraft(null)} onSaved={saved} />
  }

  return (
    <div className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      {list === null ? (
        <PageLoader height="section" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setDraft({ ...address, label: address.label ?? '', complement: address.complement ?? '' })}
              onMakeDefault={() => makeDefault(address)}
              onRemove={() => remove(address)}
            />
          ))}
          <li>
            <button
              type="button"
              onClick={() =>
                setDraft({ ...emptyAddress(auth.profile?.full_name ?? ''), is_default: list.length === 0 })
              }
              className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-tile border-2 border-dashed text-sm font-semibold transition-colors hover:border-foreground hover:bg-secondary"
            >
              <Plus size={22} weight="bold" /> Novo endereço
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
