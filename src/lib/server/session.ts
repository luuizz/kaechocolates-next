import 'server-only'
import { db } from './db'
import { getNeonAuth } from './neon-auth'
import type { Profile } from '@/types/account'

// Usuário da sessão atual (cookie do Neon Auth) ou null
export async function getSessionUser() {
  const auth = getNeonAuth()
  if (!auth) return null
  const { data } = await auth.getSession()
  const user = data?.user
  return user?.id ? { id: user.id, email: user.email ?? null } : null
}

// Perfil da loja (nome, telefone, papel). O ensure_profile cria a linha no primeiro login.
export async function getProfile(userId: string): Promise<Profile | null> {
  const { rows } = await db().query<Profile>(
    'select id, email, full_name, phone, role from public.profiles where id = $1',
    [userId],
  )
  return rows[0] ?? null
}

export type SessionAccess =
  { status: 'anonymous' } | { status: 'forbidden'; profile: Profile | null } | { status: 'admin'; profile: Profile }

// Quem pode abrir o painel: só perfis com papel admin
export async function getAdminAccess(): Promise<SessionAccess> {
  const user = await getSessionUser()
  if (!user) return { status: 'anonymous' }
  const profile = await getProfile(user.id)
  return profile?.role === 'admin' ? { status: 'admin', profile } : { status: 'forbidden', profile }
}
