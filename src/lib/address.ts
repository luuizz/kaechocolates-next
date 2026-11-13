import type { AddressDraft } from '@/types/account'
import { DEFAULT_STATE } from '@/constants/address'

export const formatCep = (cep: string) =>
  cep
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)

export const emptyAddress = (recipient: string): AddressDraft => ({
  label: '',
  recipient,
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: DEFAULT_STATE,
  is_default: false,
})

export function validateAddress(form: AddressDraft) {
  const cep = form.cep.replace(/\D/g, '')
  return {
    recipient: form.recipient.trim().length < 2 ? 'Quem vai receber?' : null,
    cep: cep.length !== 8 ? 'CEP com 8 números.' : null,
    street: !form.street.trim() ? 'Informe a rua.' : null,
    number: !form.number.trim() ? 'Informe o número (ou "s/n").' : null,
    district: !form.district.trim() ? 'Informe o bairro.' : null,
    city: !form.city.trim() ? 'Informe a cidade.' : null,
  }
}

export const addressRow = (form: AddressDraft) => ({
  label: form.label.trim() || null,
  recipient: form.recipient.trim(),
  cep: form.cep.replace(/\D/g, ''),
  street: form.street.trim(),
  number: form.number.trim(),
  complement: form.complement.trim() || null,
  district: form.district.trim(),
  city: form.city.trim(),
  state: form.state,
})

export async function lookupCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!response.ok) return null
  const data = await response.json()
  if (data.erro) return null
  return {
    street: data.logradouro as string,
    district: data.bairro as string,
    city: data.localidade as string,
    state: data.uf as string,
  }
}
