import { getNeonAuth } from '@/lib/server/neon-auth'

type Context = { params: Promise<{ path: string[] }> }

const unavailable = () =>
  Response.json({ error: 'Login indisponível: falta NEON_AUTH_COOKIE_SECRET no projeto da Vercel.' }, { status: 503 })

// Login, cadastro, sessão e token do Neon Auth passando pelo domínio da loja
async function handle(request: Request, context: Context) {
  const auth = getNeonAuth()
  if (!auth) return unavailable()
  const handlers = auth.handler()
  const method = request.method as keyof typeof handlers
  const handler = handlers[method]
  return handler ? handler(request, context) : new Response(null, { status: 405 })
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
