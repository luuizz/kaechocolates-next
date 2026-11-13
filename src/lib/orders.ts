import type { OrderItemRow, OrderRow, OrderView } from '@/types/order'

// numeric do Postgres chega como texto
export function normalizeOrder(row: OrderRow, items: OrderItemRow[]): OrderView {
  const num = (value: unknown) => Number(value ?? 0)
  return {
    ...row,
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    shipping: num(row.shipping),
    total: num(row.total),
    items: items.map((item) => ({ ...item, unit_price: num(item.unit_price), total: num(item.total) })),
  }
}

export function paymentProblem(detail: string | null) {
  const messages: Record<string, string> = {
    rejected_by_issuer: 'O banco emissor recusou o pagamento. Tente outro cartão.',
    rejected_insufficient_amount: 'Saldo ou limite insuficiente.',
    rejected_bad_filled_security_code: 'Código de segurança inválido.',
    rejected_bad_filled_date: 'Data de validade inválida.',
    rejected_bad_filled_other: 'Confira os dados do cartão.',
    rejected_high_risk: 'O pagamento foi recusado por segurança. Tente outro meio.',
    rejected_call_for_authorize: 'Autorize o pagamento com o seu banco e tente de novo.',
    rejected_card_disabled: 'Cartão desativado. Ligue para o banco ou use outro.',
    rejected_duplicated_payment: 'Pagamento duplicado. Confira seus pedidos.',
    rejected_max_attempts: 'Muitas tentativas. Use outro cartão.',
    rejected_other_reason: 'O pagamento foi recusado. Tente outro cartão.',
    expired: 'O prazo do Pix acabou.',
  }
  return (detail && messages[detail]) || 'O pagamento não foi aprovado. Tente de novo ou escolha outra forma.'
}

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
