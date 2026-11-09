'use client'

import { CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input, Select } from '@/components/ui/field'
import { formatCep } from '@/lib/address'
import { useAddressForm } from './use-address-form'
import type { AddressDraft } from '@/types/account'
import { STATES } from '@/constants/address'

type AddressFormProps = { draft: AddressDraft; onCancel: () => void; onSaved: (id: number) => void }

type TextField = 'label' | 'recipient' | 'street' | 'number' | 'complement' | 'district' | 'city' | 'state'

export function AddressForm({ draft, onCancel, onSaved }: AddressFormProps) {
  const { form, setField, fieldError, changeCep, looking, error, busy, save } = useAddressForm(draft, onSaved)
  const text = (key: TextField) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setField(key, event.target.value)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    save()
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-2xl flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apelido" hint="Casa, trabalho…">
          <Input value={form.label} onChange={text('label')} maxLength={40} />
        </Field>
        <Field label="Quem recebe" error={fieldError('recipient')}>
          <Input value={form.recipient} onChange={text('recipient')} autoComplete="name" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field label="CEP" error={fieldError('cep')} hint={looking ? 'Buscando endereço…' : undefined}>
          <Input
            value={formatCep(form.cep)}
            onChange={(event) => changeCep(event.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
          />
        </Field>
        <Field label="Rua" error={fieldError('street')}>
          <Input value={form.street} onChange={text('street')} autoComplete="address-line1" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field label="Número" error={fieldError('number')}>
          <Input value={form.number} onChange={text('number')} />
        </Field>
        <Field label="Complemento">
          <Input value={form.complement} onChange={text('complement')} autoComplete="address-line2" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_7rem]">
        <Field label="Bairro" error={fieldError('district')}>
          <Input value={form.district} onChange={text('district')} />
        </Field>
        <Field label="Cidade" error={fieldError('city')}>
          <Input value={form.city} onChange={text('city')} autoComplete="address-level2" />
        </Field>
        <Field label="UF">
          <Select value={form.state} onChange={text('state')}>
            {STATES.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(event) => setField('is_default', event.target.checked)}
          className="size-4 accent-foreground"
        />
        Usar como endereço padrão
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={busy}>
          {busy && <CircleNotch className="animate-spin" />} Salvar endereço
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
