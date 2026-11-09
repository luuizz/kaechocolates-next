'use client'

import { useState } from 'react'
import { addressRow, lookupCep, validateAddress } from '@/lib/address'
import { getNeon, unwrap } from '@/lib/neon'
import type { AddressDraft } from '@/types/account'

// Estado do formulário de endereço: busca por CEP, validação e gravação
export function useAddressForm(draft: AddressDraft, onSaved: (id: number) => void) {
  const [form, setForm] = useState<AddressDraft>(draft)
  const [tried, setTried] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [looking, setLooking] = useState(false)

  const errors = validateAddress(form)
  const fieldError = (key: keyof typeof errors) => (tried ? errors[key] : null)
  const setField = <K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const changeCep = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setField('cep', digits)
    if (digits.length !== 8) return
    setLooking(true)
    const found = await lookupCep(digits).catch(() => null)
    setLooking(false)
    if (found)
      setForm((current) => ({
        ...current,
        street: found.street || current.street,
        district: found.district || current.district,
        city: found.city || current.city,
        state: found.state || current.state,
      }))
  }

  const save = async () => {
    setTried(true)
    setError('')
    if (Object.values(errors).some(Boolean)) return
    setBusy(true)
    try {
      const addresses = () => getNeon().from('addresses')
      const row = { ...addressRow(form), is_default: form.is_default }
      if (form.is_default) unwrap(await addresses().update({ is_default: false }).eq('is_default', true))
      let id = form.id
      if (id) unwrap(await addresses().update(row).eq('id', id))
      else id = (unwrap(await addresses().insert(row).select('id')) as { id: number }[])[0]?.id
      onSaved(id ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setBusy(false)
    }
  }

  return { form, setField, fieldError, changeCep, looking, error, busy, save }
}
