'use server'

import { fail, ok } from '@/lib/result'
import { openSubscription, syncSubscription } from '@/lib/server/club'
import { changeSubscription, startSubscription } from '@/lib/server/club-subscription'
import { getCurrentProfile } from '@/lib/server/session'
import { SUBSCRIBE_ERRORS, subscribeSchema, subscriptionActionSchema } from '@/lib/validation/club'
import { parseWith } from '@/lib/validation/parse'

export async function subscribeToClub(input: unknown) {
  const user = await getCurrentProfile()
  if (!user) return fail('Entre na sua conta para assinar.')
  const parsed = parseWith(subscribeSchema, input, SUBSCRIBE_ERRORS)
  if (!parsed.ok) return fail(parsed.error)
  return startSubscription(user, parsed.data)
}

export async function manageSubscription(input: unknown) {
  const user = await getCurrentProfile()
  if (!user) return fail('Entre na sua conta.')
  const parsed = subscriptionActionSchema.safeParse(input)
  if (!parsed.success) return fail('Ação inválida.')
  return changeSubscription(user, parsed.data)
}

export async function syncMySubscription() {
  const user = await getCurrentProfile()
  if (!user) return fail('Entre na sua conta.')
  const sub = await openSubscription(user.id)
  if (sub?.status === 'pending') await syncSubscription(sub).catch((error) => console.error('[clube] sync', error))
  return ok(undefined)
}
