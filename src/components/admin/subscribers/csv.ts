import { formatPhone } from '@/lib/utils'
import type { Subscription } from '@/types/club'

const HEADER = [
  'Nome',
  'Plano',
  'Barras',
  'Restrições',
  'Destinatário',
  'Endereço',
  'Complemento',
  'Bairro',
  'Cidade',
  'UF',
  'CEP',
  'Telefone',
  'E-mail',
]

const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function shippingListCsv(rows: Subscription[]) {
  const lines = rows.map((sub) => {
    const a = sub.shipping_address
    return [
      sub.customer.name,
      sub.plan.name,
      sub.plan.bars,
      sub.notes,
      a.recipient,
      `${a.street}, ${a.number}`,
      a.complement,
      a.district,
      a.city,
      a.state,
      a.cep.replace(/^(\d{5})/, '$1-'),
      sub.customer.phone ? formatPhone(sub.customer.phone) : '',
      sub.customer.email,
    ]
      .map(cell)
      .join(';')
  })
  return '\uFEFF' + [HEADER.map(cell).join(';'), ...lines].join('\n')
}

export function downloadShippingList(rows: Subscription[]) {
  const blob = new Blob([shippingListCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `clube-envios-${new Date().toISOString().slice(0, 7)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
