'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { deleteImage, deleteProduct, getProduct, refreshStore, saveProduct, uploadImage } from '@/lib/admin-api'
import { slugify } from '@/lib/utils'
import { draftFromProduct, EMPTY_DRAFT, inputFromDraft, validateDraft, type Draft, type SetField } from './draft'
import { IMAGE_MAX_BYTES, IMAGE_TYPES } from '@/constants/limits'

const message = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

// Estado e ações do editor de barra: carregar, editar, enviar foto, salvar e excluir
export function useProductEditor(id: number | null) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(id ? null : EMPTY_DRAFT)
  const [original, setOriginal] = useState<Draft | null>(id ? null : EMPTY_DRAFT)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const uploaded = useRef<string[]>([])

  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then((product) => {
        if (!product) {
          toast.error('Produto não encontrado.')
          router.replace('/admin/produtos')
          return
        }
        const loaded = draftFromProduct(product)
        setDraft(loaded)
        setOriginal(loaded)
      })
      .catch((err) => toast.error(err.message))
  }, [id, router])

  // Avisa antes de sair com mudanças não salvas
  const dirty = Boolean(draft && original && JSON.stringify(draft) !== JSON.stringify(original))
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set: SetField = (key, value) =>
    setDraft((current) => {
      if (!current) return current
      const next = { ...current, [key]: value }
      // O endereço da página acompanha nome e % de cacau até ser editado à mão
      if (!slugTouched && (key === 'name' || key === 'cacao')) next.slug = slugify(`${next.name} ${next.cacao}`)
      return next
    })

  const editSlug = (value: string) => {
    setSlugTouched(true)
    set('slug', slugify(value) + (value.endsWith('-') ? '-' : ''))
  }

  const errors = draft ? validateDraft(draft) : null
  const error = (key: keyof NonNullable<typeof errors>) => (tried && errors ? errors[key] : null)

  const uploadPhoto = async (file?: File | null) => {
    if (!file) return
    if (!(file.type in IMAGE_TYPES)) return toast.error('Envie uma imagem PNG, JPG, WebP ou AVIF.')
    if (file.size > IMAGE_MAX_BYTES) return toast.error('A imagem deve ter no máximo 4 MB.')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      uploaded.current.push(url)
      set('image', url)
      toast.success('Foto enviada. Salve para publicar.')
    } catch (err) {
      toast.error(message(err, 'Não foi possível enviar a foto.'))
    }
    setUploading(false)
  }

  const save = async () => {
    if (!draft || !errors) return
    setTried(true)
    if (Object.values(errors).some(Boolean)) return toast.error('Confira os campos destacados.')
    setSaving(true)
    try {
      const saved = await saveProduct(inputFromDraft(draft))
      // Fotos trocadas antes de salvar (e a antiga, se mudou) saem do armazenamento
      const stale = [...uploaded.current, original?.image].filter(
        (url): url is string => Boolean(url) && url !== saved.image,
      )
      uploaded.current = []
      await Promise.all(stale.map(deleteImage))
      await refreshStore().catch(() => toast.warning('Salvo. A loja pode levar alguns minutos para mostrar a mudança.'))
      toast.success(draft.id ? 'Barra atualizada.' : 'Barra criada.')
      const next = { ...draft, id: saved.id, sortOrder: String(saved.sortOrder) }
      setDraft(next)
      setOriginal(next)
      if (!draft.id) router.replace(`/admin/produtos/${saved.id}`)
    } catch (err) {
      toast.error(message(err, 'Não foi possível salvar.'))
    }
    setSaving(false)
  }

  const remove = async () => {
    if (
      !draft?.id ||
      !window.confirm(
        `Excluir ${draft.name}? Isso não pode ser desfeito. Para só tirar da loja, desligue "Visível na loja".`,
      )
    )
      return
    try {
      await deleteProduct(draft.id)
      if (draft.image) await deleteImage(draft.image)
      await refreshStore().catch(() => {})
      toast.success('Barra excluída.')
      setOriginal(draft)
      router.replace('/admin/produtos')
    } catch (err) {
      toast.error(message(err, 'Não foi possível excluir.'))
    }
  }

  return { draft, original, dirty, saving, uploading, set, editSlug, error, uploadPhoto, save, remove }
}
