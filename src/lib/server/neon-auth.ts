import 'server-only'
import { createNeonAuth, type NeonAuth } from '@neon/neon-js/auth/next/server'
import { neonEnv } from '@/lib/env'

// Sem as variáveis (build do CI) o site sobe e só o login fica indisponível
let instance: NeonAuth | null | undefined

export function getNeonAuth(): NeonAuth | null {
  if (instance !== undefined) return instance
  const baseUrl = neonEnv().authUrl
  const secret = process.env.NEON_AUTH_COOKIE_SECRET ?? ''
  instance = baseUrl && secret.length >= 32 ? createNeonAuth({ baseUrl, cookies: { secret } }) : null
  return instance
}
