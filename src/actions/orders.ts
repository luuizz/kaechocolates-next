'use server'

import { fail, ok } from '@/lib/result'
import { orderForUser } from '@/lib/server/orders'
import { getCurrentProfile } from '@/lib/server/session'

export async function getMyOrder(code: unknown) {
  const user = await getCurrentProfile()
  if (!user) return fail('Entre na sua conta.')
  if (typeof code !== 'string' || !code) return fail('Pedido não encontrado.')
  const order = await orderForUser(user, code)
  return order ? ok(order) : fail('Pedido não encontrado.')
}
