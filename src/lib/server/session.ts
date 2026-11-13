import 'server-only'
import { db, DatabaseConfigError } from './db'
import { getNeonAuth } from './neon-auth'
import type { Profile } from '@/types/account'

export async function getSessionUser() {
  const auth = getNeonAuth()
  if (!auth) return null
  const { data } = await auth.getSession()
  const user = data?.user
  return user?.id ? { id: user.id, email: user.email ?? null } : null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { rows } = await db().query<Profile>(
    'select id, email, full_name, phone, role from public.profiles where id = $1',
    [userId],
  )
  return rows[0] ?? null
}

export async function getCurrentProfile() {
  const user = await getSessionUser()
  return user ? getProfile(user.id) : null
}

export type SessionAccess =
  | { status: 'anonymous' }
  | { status: 'unavailable'; reason: string }
  | { status: 'forbidden'; profile: Profile | null }
  | { status: 'admin'; profile: Profile }

export async function getAdminAccess(): Promise<SessionAccess> {
  const user = await getSessionUser()
  if (!user) return { status: 'anonymous' }
  try {
    const profile = await getProfile(user.id)
    return profile?.role === 'admin' ? { status: 'admin', profile } : { status: 'forbidden', profile }
  } catch (error) {
    if (error instanceof DatabaseConfigError) return { status: 'unavailable', reason: error.message }
    throw error
  }
}
