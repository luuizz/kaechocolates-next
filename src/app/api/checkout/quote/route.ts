import { brand } from '@/config/brand'
import { db } from '@/lib/server/db'
import { quoteSchema } from '@/lib/validation/checkout'

// Prévia do pedido com preços, descontos e frete calculados pelo banco
export async function POST(request: Request) {
  const input = quoteSchema.safeParse(await request.json().catch(() => null))
  if (!input.success) return Response.json({ error: 'Sacola inválida.' }, { status: 400 })
  const { items, state } = input.data
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
