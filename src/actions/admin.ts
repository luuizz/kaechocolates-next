'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { CATALOG_TAG } from '@/constants/catalog'
import { fail, ok } from '@/lib/result'
import { notifyOrder } from '@/lib/server/email'
import { getAdminAccess } from '@/lib/server/session'

const denied = () => fail('Acesso restrito a administradores.')

export async function refreshStore() {
  if ((await getAdminAccess()).status !== 'admin') return denied()
  revalidateTag(CATALOG_TAG, { expire: 0 })
  revalidatePath('/', 'layout')
  return ok(undefined)
}

export async function notifyOrderUpdate(code: unknown) {
  if ((await getAdminAccess()).status !== 'admin') return denied()
  if (typeof code !== 'string' || !code) return fail('Pedido não encontrado.')
  await notifyOrder(code)
  return ok(undefined)
}
