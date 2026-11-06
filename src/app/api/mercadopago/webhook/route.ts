import { db } from '@/lib/server/db'
import { getMpOrder, paymentSnapshot, validWebhookSignature } from '@/lib/server/mercadopago'

// Avisos do Mercado Pago (tópico "Order"). Não confiamos no corpo do aviso:
// buscamos o pedido na API deles e gravamos o status que vier de lá.
// Configure em Suas integrações → Webhooks: https://<site>/api/mercadopago/webhook
export async function POST(request: Request) {
  const url = new URL(request.url)
  const body = await request.json().catch(() => ({}))
  const dataId: string | undefined = url.searchParams.get('data.id') ?? body?.data?.id
  if (!dataId) return Response.json({ ok: true }) // aviso de outro tipo: só confirma

  if (!validWebhookSignature(request, dataId)) return Response.json({ error: 'Assinatura inválida.' }, { status: 401 })

  try {
    const mpOrder = await getMpOrder(dataId)
    if (!mpOrder.external_reference?.startsWith('KAE-')) return Response.json({ ok: true })
    await db().query('select public.apply_payment($1, $2::jsonb)', [mpOrder.external_reference, JSON.stringify(paymentSnapshot(mpOrder))])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('[webhook]', error)
    // 500 faz o Mercado Pago tentar de novo mais tarde
    return Response.json({ error: 'Falha ao processar.' }, { status: 500 })
  }
}
