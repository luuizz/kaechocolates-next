// Neon Auth simulado: o Neon Auth é um Better Auth gerenciado, com o plugin de JWT
// (o token que a Data API aceita) e um endpoint de token anônimo para visitantes.
import http from 'node:http'
import pg from 'pg'
import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins'
import { toNodeHandler } from 'better-auth/node'
import { getMigrations } from 'better-auth/db/migration'

export async function startAuth(databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl, options: '-c search_path=neon_auth' })
  const auth = betterAuth({
    database: pool,
    baseURL: 'http://localhost:54321',
    basePath: '/neondb/auth',
    secret: 'e2e-secret-only-for-local-tests-0123456789',
    trustedOrigins: ['http://localhost:3100', 'http://127.0.0.1:3100'],
    emailAndPassword: { enabled: true, sendResetPassword: async () => {} },
    advanced: { database: { generateId: 'uuid' }, defaultCookieAttributes: { sameSite: 'none', secure: true } },
    plugins: [jwt({ jwks: { keyPairConfig: { alg: 'RS256' } }, jwt: { definePayload: ({ user }) => ({ email: user.email, role: 'authenticated' }) } })],
  })

  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  const handler = toNodeHandler(auth)
  http.createServer(async (req, res) => {
    if (req.url.startsWith('/neondb/auth/token/anonymous')) {
      const { token } = await auth.api.signJWT({ body: { payload: { role: 'anonymous' } } })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ token, expires_at: Math.floor(Date.now() / 1000) + 900 }))
    }
    return handler(req, res)
  }).listen(4000, '127.0.0.1')

  return {
    // Gera a chave (se ainda não existe) e devolve as chaves públicas
    async jwks() {
      await auth.api.signJWT({ body: { payload: { role: 'anonymous' } } })
      const response = await fetch('http://127.0.0.1:4000/neondb/auth/jwks', { headers: { host: '127.0.0.1:4000' } })
      return response.json()
    },
  }
}
