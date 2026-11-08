import { isAdminRequest } from '@/lib/admin-guard'
import { notifyOrder } from '@/lib/server/email'

// O painel chama depois de mudar o andamento do pedido (ex.: enviado com rastreio)
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  await notifyOrder((await params).code)
  return Response.json({ ok: true })
}
