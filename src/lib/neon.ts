'use client'

import { createClient } from '@neon/neon-js/supabase'
import { PASSWORD_MIN } from '@/constants/limits'
import { neonEnv } from '@/lib/env'

const { authUrl, dataApiUrl } = neonEnv()

export const isNeonConfigured = Boolean(authUrl && dataApiUrl)

type NeonClient = ReturnType<typeof createClient>
let client: NeonClient | null = null

export function getNeon(): NeonClient {
  if (!isNeonConfigured)
    throw new Error('Login indisponível: faltam NEXT_PUBLIC_NEON_AUTH_URL e NEXT_PUBLIC_NEON_DATA_API_URL.')
  if (typeof window === 'undefined') throw new Error('O cliente do Neon só roda no navegador.')
  client ??= createClient({
    auth: { url: `${window.location.origin}/api/auth`, allowAnonymous: true },
    dataApi: { url: dataApiUrl },
  })
  return client
}

export function unwrap<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw new Error(friendlyError(result.error))
  return result.data
}

type ErrorLike = { code?: string; message?: string } | string | null | undefined

export function friendlyError(error: unknown): string {
  if (!error) return ''
  const err = error as ErrorLike
  const message = typeof err === 'string' ? err : (err?.message ?? String(error))
  const code = typeof err === 'object' && err ? err.code : undefined

  const byCode: Record<string, string> = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    user_already_exists: 'Já existe uma conta com este e-mail.',
    email_exists: 'Já existe uma conta com este e-mail.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.',
    weak_password: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`,
    email_address_invalid: 'E-mail inválido.',
    over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
    INVALID_ORIGIN: 'Este endereço não está autorizado a fazer login. Adicione-o aos domínios confiáveis do Neon Auth.',
    INVALID_PASSWORD: 'Senha atual incorreta.',
    INVALID_TOKEN: 'O link expirou ou já foi usado. Peça um novo.',
    PASSWORD_TOO_SHORT: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`,
    '23505': 'Já existe um registro com esse identificador.',
    '23503': 'Este registro está em uso e não pode ser removido.',
    '23514': 'Algum campo está com um valor inválido. Confira e tente de novo.',
  }
  if (code && byCode[code]) return byCode[code]

  const byMessage: Record<string, string> = {
    'Invalid email or password': 'E-mail ou senha incorretos.',
    'Invalid password': 'Senha atual incorreta.',
    'User already exists': 'Já existe uma conta com este e-mail.',
    'Invalid token': 'O link expirou ou já foi usado. Peça um novo.',
    'Invalid origin':
      'Este endereço não está autorizado a fazer login. Adicione-o aos domínios confiáveis do Neon Auth.',
    'Failed to fetch': 'Não foi possível conectar ao servidor. Verifique sua internet.',
  }
  for (const [key, value] of Object.entries(byMessage)) {
    if (message.includes(key)) return value
  }

  if (code === '42501' && !/[À-ú]/.test(message)) return 'Você não tem permissão para fazer isso.'
  return message
}
