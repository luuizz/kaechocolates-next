import { z } from 'zod'
import { validCpf } from '@/lib/cpf'
import { cartSchema } from './cart'

export const cpfSchema = z
  .unknown()
  .optional()
  .transform((value) => String(value ?? '').replace(/\D/g, ''))
  .refine(validCpf)
export const addressIdSchema = z.coerce.number().int().positive()
const uf = z.string().regex(/^[A-Z]{2}$/)

export const quoteSchema = z.object({
  items: cartSchema,
  state: uf.nullable().catch(null),
})

const card = z.object({
  token: z.string().min(1),
  paymentMethodId: z.string().min(1),
  paymentTypeId: z
    .unknown()
    .optional()
    .transform((value) => (value === 'debit_card' ? 'debit_card' : 'credit_card') as 'debit_card' | 'credit_card'),
  installments: z
    .unknown()
    .optional()
    .transform((value) => Number(value) || 1),
})

type Payment = { method: 'pix' } | { method: 'card'; card: z.output<typeof card> }

export const checkoutSchema = z
  .object({
    items: cartSchema,
    addressId: addressIdSchema,
    method: z.enum(['pix', 'card']),
    cpf: cpfSchema,
    card: z.unknown().optional(),
  })
  .transform(({ card: rawCard, method, ...rest }, ctx) => {
    if (method === 'pix') return { ...rest, method } as typeof rest & Payment
    const parsed = card.safeParse(rawCard)
    if (!parsed.success) {
      ctx.addIssue({ code: 'custom', path: ['card'], message: 'Cartão inválido.' })
      return z.NEVER
    }
    return { ...rest, method, card: parsed.data } as typeof rest & Payment
  })

export const CHECKOUT_ERRORS = {
  items: 'Sacola inválida.',
  addressId: 'Escolha um endereço de entrega.',
  method: 'Escolha a forma de pagamento.',
  cpf: 'Informe um CPF válido.',
  card: 'Preencha os dados do cartão.',
}

export type CheckoutInput = z.output<typeof checkoutSchema>
