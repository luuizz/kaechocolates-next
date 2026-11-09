import { revalidatePath, revalidateTag } from 'next/cache'
import { CATALOG_TAG } from '@/lib/server/catalog'
import { isAdminRequest } from '@/lib/server/admin-guard'

// Chamado pelo painel depois de salvar: a loja mostra a mudança na hora,
// sem esperar os 5 minutos do cache do catálogo.
export async function POST(request: Request) {
  if (!(await isAdminRequest(request)))
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  revalidateTag(CATALOG_TAG, { expire: 0 })
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
