import { NextResponse, type NextRequest } from 'next/server'
import { getNeonAuth } from '@/lib/server/neon-auth'

// O papel de admin é conferido no layout do painel, que consulta o banco
export async function proxy(request: NextRequest) {
  const auth = getNeonAuth()
  if (!auth) return NextResponse.next()
  const back = `${request.nextUrl.pathname}${request.nextUrl.search}`
  return auth.middleware({ loginUrl: `/entrar?volta=${encodeURIComponent(back)}` })(request)
}

export const config = {
  matcher: ['/admin/:path*', '/conta/:path*', '/checkout/:path*', '/pedido/:path*', '/clube/assinar/:path*'],
}
