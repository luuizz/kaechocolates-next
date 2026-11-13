'use server'

import { fail } from '@/lib/result'
import { placeOrder as placeOrderService, quoteOrder } from '@/lib/server/checkout'
import { getCurrentProfile } from '@/lib/server/session'
import { CHECKOUT_ERRORS, checkoutSchema, quoteSchema } from '@/lib/validation/checkout'
import { parseWith } from '@/lib/validation/parse'

export async function getQuote(input: unknown) {
  const parsed = quoteSchema.safeParse(input)
  if (!parsed.success) return fail('Sacola inválida.')
  return quoteOrder(parsed.data.items, parsed.data.state)
}

export async function placeOrder(input: unknown) {
  const user = await getCurrentProfile()
  if (!user) return fail('Entre na sua conta para finalizar a compra.')
  const parsed = parseWith(checkoutSchema, input, CHECKOUT_ERRORS)
  if (!parsed.ok) return fail(parsed.error)
  return placeOrderService(user, parsed.data)
}
