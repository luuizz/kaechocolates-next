import 'server-only'
import { Pool } from 'pg'

// Conexão direta com o banco, só no servidor (rotas /api). Usada para as funções
// de dinheiro (quote_order, place_order, apply_payment), que clientes não podem chamar.
// Na Vercel, DATABASE_URL vem da integração do Neon (use a connection string com -pooler).
const globalForDb = globalThis as unknown as { kaePool?: Pool }

export function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Checkout indisponível: falta DATABASE_URL no projeto da Vercel.')
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
