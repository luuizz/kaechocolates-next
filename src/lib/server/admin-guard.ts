import 'server-only'
import { neonEnv } from '@/lib/env'

// Quem decide se o pedido vem de um admin é o próprio banco: o token do
// Neon Auth é repassado para a Data API, que roda public.is_admin().
// Assim as rotas /api não precisam guardar senha do banco.
export async function isAdminRequest(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const { dataApiUrl } = neonEnv()
  if (!/^Bearer\s+\S+/i.test(auth) || !dataApiUrl) return false
  try {
    const response = await fetch(`${dataApiUrl}/rpc/is_admin`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    })
    return response.ok && (await response.json()) === true
  } catch {
    return false
  }
}
