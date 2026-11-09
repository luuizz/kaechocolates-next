import { z } from 'zod'
import { addressIdSchema, cpfSchema } from './checkout'
import { SLUG_PATTERN } from '@/constants/patterns'

const id = z.string().regex(SLUG_PATTERN)

export const subscribeSchema = z.object({
  plan: id,
  period: id,
  addressId: addressIdSchema,
  cpf: cpfSchema,
  card: z.object({ token: z.string().min(1) }),
  notes: z
    .unknown()
    .optional()
    .transform((value) => String(value ?? '')),
})

export const SUBSCRIBE_ERRORS = {
  plan: 'Escolha o plano e o período.',
  period: 'Escolha o plano e o período.',
  addressId: 'Escolha o endereço de entrega das caixas.',
  cpf: 'Informe um CPF válido.',
  card: 'Preencha os dados do cartão.',
}

export const subscriptionActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel']),
  id: z.coerce.number().int().positive().optional().catch(undefined),
})
