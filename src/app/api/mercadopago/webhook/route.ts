import { db } from '@/lib/server/db'
import { getAuthorizedPayment, getMpOrder, getPreapproval, paymentSnapshot, preapprovalSnapshot, validWebhookSignature } from '@/lib/server/mercadopago'

// Avisos do Mercado Pago. Não confiamos no corpo do aviso: buscamos o recurso
// na API deles e gravamos o status que vier de lá.
// Configure em Suas integrações → Webhooks: https://<site>/api/mercadopago/webhook
// com os eventos "Order", "Planos e assinaturas" (subscription_preapproval)
// e "Pagamentos recorrentes" (subscription_authorized_payment).
export async function POST(request: Request) {
  const url = new URL(request.url)
  const body = await request.json().catch(() => ({}))
  const dataId: string | undefined = url.searchParams.get('data.id') ?? body?.data?.id
  if (!dataId) return Response.json({ ok: true }) // aviso de outro tipo: só confirma

  if (!validWebhookSignature(request, dataId)) return Response.json({ error: 'Assinatura inválida.' }, { status: 401 })

  const topic = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? body?.type ?? ''

  try {
    if (topic === 'subscription_preapproval') {
      const pre = await getPreapproval(dataId)
      const id = pre.external_reference?.match(/^KAE-CLUBE-(\d+)$/)?.[1]
      if (id) await db().query('select public.apply_subscription($1, $2::jsonb)', [id, JSON.stringify(preapprovalSnapshot(pre))])
      return Response.json({ ok: true })
    }
    if (topic === 'subscription_authorized_payment') {
      const charge = await getAuthorizedPayment(dataId)
      await db().query('select public.record_subscription_payment($1, $2::jsonb)', [charge.preapproval_id, JSON.stringify({
        id: String(charge.id),
        amount: charge.transaction_amount,
        status: charge.payment?.status ?? charge.status,
        status_detail: charge.payment?.status_detail,
        date: charge.debit_date,
      })])
      // A próxima cobrança muda depois de cada pagamento
      const pre = await getPreapproval(charge.preapproval_id)
      const id = pre.external_reference?.match(/^KAE-CLUBE-(\d+)$/)?.[1]
      if (id) await db().query('select public.apply_subscription($1, $2::jsonb)', [id, JSON.stringify(preapprovalSnapshot(pre))])
      return Response.json({ ok: true })
    }

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
