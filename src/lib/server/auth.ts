import { neonEnv } from '@/lib/env'

export type SessionUser = { id: string; email: string | null; full_name: string | null; phone: string | null; role: 'customer' | 'admin' }

// Descobre quem fez o pedido a partir do token do Neon Auth: a Data API valida o
// token e devolve o perfil (ensure_profile). Sem token válido, devolve null.
export async function userFromRequest(request: Request): Promise<SessionUser | null> {
  const auth = request.headers.get('authorization') ?? ''
  const { dataApiUrl } = neonEnv()
  if (!/^Bearer\s+\S+/i.test(auth) || !dataApiUrl) return null
  try {
    const response = await fetch(`${dataApiUrl}/rpc/ensure_profile`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    })
    if (!response.ok) return null
    const profile = (await response.json()) as SessionUser
    return profile?.id ? profile : null
  } catch {
    return null
  }
}
