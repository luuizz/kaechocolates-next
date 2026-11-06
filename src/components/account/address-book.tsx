'use client'

import { useCallback, useEffect, useState } from 'react'
import { CircleNotch, MapPin, PencilSimple, Plus, Star, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input, Select } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { getNeon, unwrap } from '@/lib/neon'

export type Address = {
  id: number
  label: string | null
  recipient: string
  cep: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  is_default: boolean
}

type Draft = Omit<Address, 'id' | 'is_default' | 'label' | 'complement'> & { id?: number; label: string; complement: string; is_default: boolean }

export const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export const formatCep = (cep: string) => cep.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9)

// Preenche rua, bairro, cidade e estado pelo CEP (ViaCEP, chamado do navegador)
async function lookupCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!response.ok) return null
  const data = await response.json()
  if (data.erro) return null
  return { street: data.logradouro as string, district: data.bairro as string, city: data.localidade as string, state: data.uf as string }
}

const empty = (recipient: string): Draft => ({ label: '', recipient, cep: '', street: '', number: '', complement: '', district: '', city: '', state: 'MG', is_default: false })

export function AddressBook() {
  const auth = useAuth()
  const [list, setList] = useState<Address[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const rows = unwrap(await getNeon().from('addresses').select('*').order('is_default', { ascending: false }).order('id')) as Address[]
      setList(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os endereços.')
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
      setError(err instanceof Error ? err.message : 'Não foi possível remover.')
    }
  }

  const makeDefault = async (address: Address) => {
    try {
      const neon = getNeon()
      unwrap(await neon.from('addresses').update({ is_default: false }).eq('is_default', true))
      unwrap(await neon.from('addresses').update({ is_default: true }).eq('id', address.id))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    }
  }

  if (draft) return <AddressForm draft={draft} onCancel={() => setDraft(null)} onSaved={async () => { setDraft(null); await load() }} />

  return (
    <div className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      {list === null ? (
        <div className="grid min-h-40 place-items-center"><CircleNotch size={28} className="animate-spin text-muted-foreground" aria-label="Carregando" /></div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((address) => (
            <li key={address.id} className="flex flex-col rounded-[1.5rem] border p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 font-display font-bold"><MapPin size={18} weight="duotone" /> {address.label || 'Endereço'}</p>
                {address.is_default && <span className="rounded-full bg-flavor-yellow px-2.5 py-0.5 text-xs font-bold">Padrão</span>}
              </div>
              <p className="mt-2 text-sm">{address.recipient}</p>
              <p className="text-sm text-muted-foreground">{address.street}, {address.number}{address.complement ? ` · ${address.complement}` : ''}</p>
              <p className="text-sm text-muted-foreground">{address.district} · {address.city}/{address.state} · {formatCep(address.cep)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDraft({ ...address, label: address.label ?? '', complement: address.complement ?? '' })}><PencilSimple /> Editar</Button>
                {!address.is_default && <Button size="sm" variant="ghost" onClick={() => makeDefault(address)}><Star /> Tornar padrão</Button>}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(address)}><Trash /> Remover</Button>
              </div>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setDraft({ ...empty(auth.profile?.full_name ?? ''), is_default: list.length === 0 })} className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed text-sm font-semibold transition-colors hover:border-foreground hover:bg-secondary">
              <Plus size={22} weight="bold" /> Novo endereço
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

function AddressForm({ draft, onCancel, onSaved }: { draft: Draft; onCancel: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Draft>(draft)
  const [tried, setTried] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [looking, setLooking] = useState(false)
  const set = (key: keyof Draft) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const cep = form.cep.replace(/\D/g, '')
  const errors = {
    recipient: form.recipient.trim().length < 2 ? 'Quem vai receber?' : null,
    cep: cep.length !== 8 ? 'CEP com 8 números.' : null,
    street: !form.street.trim() ? 'Informe a rua.' : null,
    number: !form.number.trim() ? 'Informe o número (ou "s/n").' : null,
    district: !form.district.trim() ? 'Informe o bairro.' : null,
    city: !form.city.trim() ? 'Informe a cidade.' : null,
  }

  const onCep = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setForm((current) => ({ ...current, cep: digits }))
    if (digits.length !== 8) return
    setLooking(true)
    const found = await lookupCep(digits).catch(() => null)
    setLooking(false)
    if (found) setForm((current) => ({ ...current, street: found.street || current.street, district: found.district || current.district, city: found.city || current.city, state: found.state || current.state }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTried(true)
    setError('')
    if (Object.values(errors).some(Boolean)) return
    setBusy(true)
    try {
      const neon = getNeon()
      const row = {
        label: form.label.trim() || null,
        recipient: form.recipient.trim(),
        cep,
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim() || null,
        district: form.district.trim(),
        city: form.city.trim(),
        state: form.state,
      }
      if (form.is_default) unwrap(await neon.from('addresses').update({ is_default: false }).eq('is_default', true))
      if (form.id) unwrap(await neon.from('addresses').update({ ...row, is_default: form.is_default }).eq('id', form.id))
      else unwrap(await neon.from('addresses').insert({ ...row, is_default: form.is_default }))
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-2xl flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apelido" hint="Casa, trabalho…"><Input value={form.label} onChange={set('label')} maxLength={40} /></Field>
        <Field label="Quem recebe" error={tried ? errors.recipient : null}><Input value={form.recipient} onChange={set('recipient')} autoComplete="name" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field label="CEP" error={tried ? errors.cep : null} hint={looking ? 'Buscando endereço…' : undefined}>
          <Input value={formatCep(form.cep)} onChange={(event) => onCep(event.target.value)} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" />
        </Field>
        <Field label="Rua" error={tried ? errors.street : null}><Input value={form.street} onChange={set('street')} autoComplete="address-line1" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="Número" error={tried ? errors.number : null}><Input value={form.number} onChange={set('number')} /></Field>
        <Field label="Complemento"><Input value={form.complement} onChange={set('complement')} autoComplete="address-line2" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_7rem]">
        <Field label="Bairro" error={tried ? errors.district : null}><Input value={form.district} onChange={set('district')} /></Field>
        <Field label="Cidade" error={tried ? errors.city : null}><Input value={form.city} onChange={set('city')} autoComplete="address-level2" /></Field>
        <Field label="UF"><Select value={form.state} onChange={set('state')}>{STATES.map((uf) => <option key={uf}>{uf}</option>)}</Select></Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.is_default} onChange={(event) => setForm({ ...form, is_default: event.target.checked })} className="size-4 accent-foreground" />
        Usar como endereço padrão
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={busy}>{busy && <CircleNotch className="animate-spin" />} Salvar endereço</Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
