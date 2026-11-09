import 'server-only'
import { Pool } from 'pg'

// Conexão direta com o banco, só no servidor (Server Actions, webhook e layouts). Usada para as
// funções de dinheiro (quote_order, place_order, apply_payment) e para conferir o papel de admin.
// Na Vercel, DATABASE_URL vem da integração do Neon (use a connection string com -pooler).
const globalForDb = globalThis as unknown as { kaePool?: Pool }

export class DatabaseConfigError extends Error {}

// `vercel env pull` não baixa variáveis Sensitive: no lugar do valor fica um marcador
function databaseUrl() {
  const url = (process.env.DATABASE_URL ?? '').trim()
  if (!url) throw new DatabaseConfigError('Falta DATABASE_URL.')
  if (!/^postgres(ql)?:\/\//.test(url))
    throw new DatabaseConfigError(
      'DATABASE_URL não é uma connection string. Variáveis Sensitive não vêm no `vercel env pull`: copie a do Console do Neon.',
    )
  return url
}

export function db() {
  const url = databaseUrl()
  if (!globalForDb.kaePool) {
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url)
    globalForDb.kaePool = new Pool({ connectionString: url, max: 3, ssl: local ? false : { rejectUnauthorized: true } })
  }
  return globalForDb.kaePool
}

// Erros levantados de propósito nas funções do banco (P0001) viram mensagem para o cliente
export function dbMessage(error: unknown, fallback: string) {
  const err = error as { code?: string; message?: string }
  return err?.code === 'P0001' && err.message ? err.message : fallback
}
