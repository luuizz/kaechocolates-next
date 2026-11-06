import { brand } from '@/config/brand'
import { db } from '@/lib/server/db'
import { parseCart } from '@/lib/server/cart-input'

// Prévia do pedido com preços, descontos e frete calculados pelo banco
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const items = parseCart(body?.items)
  if (!items) return Response.json({ error: 'Sacola inválida.' }, { status: 400 })
  const state = typeof body?.state === 'string' && /^[A-Z]{2}$/.test(body.state) ? body.state : null
  try {
    const { rows } = await db().query('select public.quote_order($1::jsonb, $2, $3) as quote', [JSON.stringify(items), state, brand.commerce.freeShippingFrom])
    const { need: _need, ...quote } = rows[0].quote
    void _need
    return Response.json(quote)
  } catch (error) {
    console.error('[checkout/quote]', error)
    return Response.json({ error: error instanceof Error && error.message.includes('DATABASE_URL') ? error.message : 'Não foi possível calcular o pedido.' }, { status: 503 })
  }
}
