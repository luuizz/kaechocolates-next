import type { ACCOUNT_TABS } from '@/constants/navigation'

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
}

export type Customer = Profile & { created_at: string }

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

export type AddressDraft = Omit<Address, 'id' | 'is_default' | 'label' | 'complement'> & {
  id?: number
  label: string
  complement: string
  is_default: boolean
}

export type ShippingAddress = Pick<
  Address,
  'recipient' | 'cep' | 'street' | 'number' | 'complement' | 'district' | 'city' | 'state'
>

export type OrderCustomer = { name: string; email: string; phone: string | null; cpf: string }

export type AccountTabId = (typeof ACCOUNT_TABS)[number]['id']
