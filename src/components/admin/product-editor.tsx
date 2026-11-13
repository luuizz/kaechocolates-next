'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowSquareOut, CircleNotch, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/page-loader'
import { AdminHeader } from './admin-page'
import { InfoPanel, PricePanel } from './product-form/details-panels'
import { previewFromDraft } from './product-form/draft'
import { PhotoPanel } from './product-form/photo-panel'
import { PreviewPanel, StorePanel } from './product-form/side-panels'
import { useProductEditor } from './product-form/use-product-editor'

export function ProductEditor({ id }: { id: number | null }) {
  const { draft, original, dirty, saving, uploading, set, editSlug, error, uploadPhoto, save, remove } =
    useProductEditor(id)

  if (!draft) return <PageLoader />

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    save()
  }

  return (
    <form onSubmit={submit} noValidate>
      <Link
        href="/admin/produtos"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft /> Produtos
      </Link>
      <AdminHeader
        title={draft.id ? `${original?.name} ${original?.cacao}%` : 'Nova barra'}
        description={dirty ? 'Alterações não salvas' : draft.id ? 'Tudo salvo' : 'Preencha e salve para publicar'}
        actions={
          <>
            {draft.id && (
              <Button asChild variant="outline">
                <a href={`/produtos/${original?.slug}`} target="_blank" rel="noreferrer">
                  <ArrowSquareOut /> Ver na loja
                </a>
              </Button>
            )}
            <Button type="submit" disabled={saving || uploading}>
              {saving && <CircleNotch className="animate-spin" />} Salvar
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <InfoPanel draft={draft} set={set} error={error} onSlugChange={editSlug} />
          <PricePanel draft={draft} set={set} error={error} />
          <PhotoPanel draft={draft} set={set} uploading={uploading} onFile={uploadPhoto} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
          <StorePanel draft={draft} set={set} />
          <PreviewPanel preview={previewFromDraft(draft)} />
          {draft.id && (
            <Button type="button" variant="ghost" className="self-start text-destructive" onClick={remove}>
              <Trash /> Excluir barra
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
