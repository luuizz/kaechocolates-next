import 'server-only'
import { createNeonAuth, type NeonAuth } from '@neon/neon-js/auth/next/server'
import { neonEnv } from '@/lib/env'

// Neon Auth do lado do servidor: o login passa por /api/auth e a sessão fica num
// cookie assinado no domínio da loja, legível pelo proxy, layouts e Server Actions.
// Criado sob demanda: sem as variáveis (build do CI, primeiro `yarn dev`) o site
// sobe e só o login fica indisponível.
let instance: NeonAuth | null | undefined

export function getNeonAuth(): NeonAuth | null {
  if (instance !== undefined) return instance
  const baseUrl = neonEnv().authUrl
  const secret = process.env.NEON_AUTH_COOKIE_SECRET ?? ''
  instance = baseUrl && secret.length >= 32 ? createNeonAuth({ baseUrl, cookies: { secret } }) : null
  return instance
}
