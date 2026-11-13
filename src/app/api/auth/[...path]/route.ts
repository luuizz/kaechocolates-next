import { getNeonAuth } from '@/lib/server/neon-auth'

type Context = { params: Promise<{ path: string[] }> }

const unavailable = () =>
  Response.json({ error: 'Login indisponível: falta NEON_AUTH_COOKIE_SECRET no projeto da Vercel.' }, { status: 503 })

// Só a resposta do Neon traz o set-auth-jwt (JWT da Data API); a do cache do cookie não
async function withoutSessionCache(request: Request, context: Context) {
  const path = (await context.params).path.join('/')
  if (request.method !== 'GET' || path !== 'get-session') return request
  const url = new URL(request.url)
  url.searchParams.set('disableCookieCache', 'true')
  return new Request(url, request)
}

async function handle(request: Request, context: Context) {
  const auth = getNeonAuth()
  if (!auth) return unavailable()
  const handlers = auth.handler()
  const method = request.method as keyof typeof handlers
  const handler = handlers[method]
  return handler ? handler(await withoutSessionCache(request, context), context) : new Response(null, { status: 405 })
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
