import 'server-only'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const API = `${process.env.MERCADOPAGO_API_URL ?? 'https://api.mercadopago.com'}/v1/orders`

export type MpPayment = {
  id: string
  status: string
  status_detail: string
  amount: string
  payment_method: {
    id: string
    type: string
    installments?: number
    qr_code?: string
    qr_code_base64?: string
    ticket_url?: string
  }
  date_of_expiration?: string
}
export type MpOrder = {
  id: string
  status: string
  status_detail: string
  external_reference: string
  transactions?: { payments?: MpPayment[] }
}

export class MpError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message)
  }
}

function token() {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!value) throw new MpError('Pagamento indisponível: falta MERCADOPAGO_ACCESS_TOKEN no projeto da Vercel.', 503)
  return value
}

async function call<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...init.headers,
    },
    cache: 'no-store',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[mercado pago]', response.status, JSON.stringify(body))
    throw new MpError('O Mercado Pago recusou a solicitação. Confira os dados e tente de novo.', response.status, body)
  }
  return body as T
}

type Payer = { email: string; firstName: string; lastName?: string; cpf: string }
type Method =
  | { kind: 'pix' }
  | {
      kind: 'card'
      token: string
      paymentMethodId: string
      paymentTypeId?: 'credit_card' | 'debit_card'
      installments: number
    }

export async function createMpOrder({
  reference,
  amount,
  payer,
  method,
  idempotencyKey,
}: {
  reference: string
  amount: number
  payer: Payer
  method: Method
  idempotencyKey?: string
}) {
  const value = amount.toFixed(2)
  const payment =
    method.kind === 'pix'
      ? { amount: value, payment_method: { id: 'pix', type: 'bank_transfer' }, expiration_time: 'PT30M' }
      : {
          amount: value,
          payment_method: {
            id: method.paymentMethodId,
            type: method.paymentTypeId ?? 'credit_card',
            token: method.token,
            installments: method.installments,
          },
        }

  return call<MpOrder>(API, {
    method: 'POST',
    headers: { 'X-Idempotency-Key': idempotencyKey ?? randomUUID() },
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'automatic',
      external_reference: reference,
      total_amount: value,
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        ...(payer.lastName && { last_name: payer.lastName }),
        identification: { type: 'CPF', number: payer.cpf },
      },
      transactions: { payments: [payment] },
    }),
  })
}

export const getMpOrder = (id: string) => call<MpOrder>(`${API}/${encodeURIComponent(id)}`, { method: 'GET' })

export function paymentSnapshot(order: MpOrder) {
  const payment = order.transactions?.payments?.[0]
  return {
    mp_order_id: order.id,
    status: payment?.status ?? order.status,
    status_detail: payment?.status_detail ?? order.status_detail,
    qr_code: payment?.payment_method.qr_code,
    qr_code_base64: payment?.payment_method.qr_code_base64,
    ticket_url: payment?.payment_method.ticket_url,
    expires_at: payment?.date_of_expiration,
    installments: payment?.payment_method.installments,
  }
}

// Manifesto: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
export function validWebhookSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // sem segredo configurado (ambiente de teste): aceita e confirma o status direto na API
  const header = request.headers.get('x-signature') ?? ''
  const parts = Object.fromEntries(header.split(',').map((part) => part.trim().split('=') as [string, string]))
  if (!parts.ts || !parts.v1) return false
  const requestId = request.headers.get('x-request-id')
  const manifest = `id:${dataId.toLowerCase()};${requestId ? `request-id:${requestId};` : ''}ts:${parts.ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))
  } catch {
    return false
  }
}

const BASE = process.env.MERCADOPAGO_API_URL ?? 'https://api.mercadopago.com'

export type MpPreapproval = {
  id: string
  status: string
  external_reference?: string
  next_payment_date?: string
  card_id?: string
  last_four_digits?: string
  summarized?: { last_charged_date?: string }
}

export type MpAuthorizedPayment = {
  id: string | number
  preapproval_id: string
  transaction_amount: number
  status: string
  debit_date?: string
  payment?: { id: number; status: string; status_detail?: string }
}

export async function createPreapproval({
  reference,
  reason,
  amount,
  months,
  payerEmail,
  cardToken,
  backUrl,
}: {
  reference: string
  reason: string
  amount: number
  months: number
  payerEmail: string
  cardToken: string
  backUrl: string
}) {
  return call<MpPreapproval>(`${BASE}/preapproval`, {
    method: 'POST',
    body: JSON.stringify({
      reason,
      external_reference: reference,
      payer_email: payerEmail,
      card_token_id: cardToken,
      back_url: backUrl,
      status: 'authorized',
      auto_recurring: {
        frequency: months,
        frequency_type: 'months',
        transaction_amount: Number(amount.toFixed(2)),
        currency_id: 'BRL',
      },
    }),
  })
}

export const getPreapproval = (id: string) =>
  call<MpPreapproval>(`${BASE}/preapproval/${encodeURIComponent(id)}`, { method: 'GET' })

export async function setPreapprovalStatus(id: string, status: 'authorized' | 'paused' | 'cancelled') {
  return call<MpPreapproval>(`${BASE}/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export const getAuthorizedPayment = (id: string) =>
  call<MpAuthorizedPayment>(`${BASE}/authorized_payments/${encodeURIComponent(id)}`, { method: 'GET' })

export const preapprovalSnapshot = (pre: MpPreapproval) => ({
  mp_preapproval_id: pre.id,
  status: pre.status,
  next_payment_date: pre.next_payment_date,
  last_four: pre.last_four_digits,
})

// Na conta de teste, o pagador precisa ser um usuário de teste do Mercado Pago
export function payerEmailFor(email: string) {
  return process.env.MERCADOPAGO_TEST_MODE === 'true' && process.env.MERCADOPAGO_TEST_PAYER_EMAIL
    ? process.env.MERCADOPAGO_TEST_PAYER_EMAIL
    : email
}
