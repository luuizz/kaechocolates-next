import { del, put } from '@vercel/blob'
import { getAdminAccess } from '@/lib/server/session'
import { IMAGE_FOLDER, IMAGE_MAX_BYTES, IMAGE_TYPES } from '@/constants/limits'

// Upload e remoção das fotos de produto no Vercel Blob (só admin).
//
// POST   /api/images  (corpo = o arquivo, Content-Type = tipo da imagem) → { url }
// DELETE /api/images  (corpo = { "url": "..." })                         → { ok: true }
//
// Na Vercel: conecte um Blob Store (público) ao projeto; ele cria BLOB_READ_WRITE_TOKEN.

const json = (status: number, body: unknown) => Response.json(body, { status })

function configError() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return 'Upload indisponível: conecte um Blob Store ao projeto na Vercel.'
  return null
}

// Só apaga arquivos do Blob da loja, dentro da pasta do painel
function isOwnBlob(url: string) {
  try {
    const { protocol, hostname, pathname } = new URL(url)
    return (
      protocol === 'https:' &&
      hostname.endsWith('.public.blob.vercel-storage.com') &&
      pathname.startsWith(`/${IMAGE_FOLDER}/`)
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if ((await getAdminAccess()).status !== 'admin') return json(403, { error: 'Acesso restrito a administradores.' })
  const misconfigured = configError()
  if (misconfigured) return json(503, { error: misconfigured })

  const type = (request.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? ''
  const ext = IMAGE_TYPES[type]
  if (!ext) return json(415, { error: 'Envie uma imagem JPG, PNG, WebP ou AVIF.' })

  const body = await request.arrayBuffer()
  if (body.byteLength === 0) return json(400, { error: 'Arquivo vazio.' })
  if (body.byteLength > IMAGE_MAX_BYTES) return json(413, { error: 'A imagem deve ter no máximo 4 MB.' })

  const blob = await put(`${IMAGE_FOLDER}/${new Date().getFullYear()}/foto.${ext}`, body, {
    access: 'public',
    contentType: type,
    addRandomSuffix: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  })

  // Confere se a imagem abre sem login (Blob Store criado como privado não serve)
  const check = await fetch(blob.url, { method: 'HEAD' }).catch(() => null)
  if (!check?.ok) {
    await del(blob.url).catch(() => {})
    return json(503, {
      error: 'A imagem foi enviada, mas não ficou pública. O Blob Store da Vercel precisa ser do tipo Public.',
    })
  }
  return json(201, { url: blob.url })
}

export async function DELETE(request: Request) {
  if ((await getAdminAccess()).status !== 'admin') return json(403, { error: 'Acesso restrito a administradores.' })
  const misconfigured = configError()
  if (misconfigured) return json(503, { error: misconfigured })

  const { url } = (await request.json().catch(() => ({}))) as { url?: unknown }
  if (typeof url !== 'string' || !isOwnBlob(url))
    return json(400, { error: 'A imagem não pertence ao armazenamento da loja.' })

  await del(url)
  return json(200, { ok: true })
}
