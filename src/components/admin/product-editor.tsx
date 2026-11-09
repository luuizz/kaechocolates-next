'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowSquareOut, CircleNotch, Image as ImageIcon, Trash, UploadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { BarPackage } from '@/components/product/bar-package'
import { BADGES, LINES, formatBRL } from '@/data/products'
import { deleteImage, deleteProduct, getProduct, refreshStore, saveProduct, uploadImage } from '@/lib/admin-api'
import { cn, slugify } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'
import { Switch } from './switch'
import type { Line, ProductInput } from '@/types/product'

type Draft = {
  id?: number
  name: string
  cacao: string
  line: Line
  slug: string
  price: string
  compareAt: string
  weight: string
  badge: string
  short: string
  description: string
  ingredients: string
  label: string
  tile: string
  labelText: 'dark' | 'light'
  image: string
  active: boolean
  soldOut: boolean
  sortOrder: string
  stock: string
}

const EMPTY: Draft = { name: '', cacao: '', line: 'intensos', slug: '', price: '', compareAt: '', weight: '70 g', badge: '', short: '', description: '', ingredients: '', label: '#e8b630', tile: '#efb72d', labelText: 'dark', image: '', active: true, soldOut: false, sortOrder: '', stock: '' }

const money = (value: string) => Number(value.replace(/\./g, '').replace(',', '.'))
const toMoney = (value?: number) => (value === undefined ? '' : value.toFixed(2).replace('.', ','))
const MAX_IMAGE = 4 * 1024 * 1024

// Formulário de barra com prévia ao vivo da embalagem e do card da vitrine
export function ProductEditor({ id }: { id: number | null }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(id ? null : EMPTY)
  const [original, setOriginal] = useState<Draft | null>(id ? null : EMPTY)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const uploaded = useRef<string[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    getProduct(id).then((product) => {
      if (!product) {
        toast.error('Produto não encontrado.')
        router.replace('/admin/produtos')
        return
      }
      const loaded: Draft = {
        id: product.id, name: product.name, cacao: String(product.cacao), line: product.line, slug: product.slug,
        price: toMoney(product.price), compareAt: toMoney(product.compareAt), weight: product.weight, badge: product.badge ?? '',
        short: product.short, description: product.description ?? '', ingredients: product.ingredients ?? '',
        label: product.label, tile: product.tile, labelText: product.labelText ?? 'dark', image: product.image ?? '',
        active: product.active, soldOut: product.soldOutFlag, sortOrder: String(product.sortOrder), stock: product.stock === undefined ? '' : String(product.stock),
      }
      setDraft(loaded)
      setOriginal(loaded)
    }).catch((err) => toast.error(err.message))
  }, [id, router])

  // Avisa antes de sair com mudanças não salvas
  const dirty = Boolean(draft && original && JSON.stringify(draft) !== JSON.stringify(original))
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (!draft) {
    return <div className="grid min-h-80 place-items-center"><CircleNotch size={32} className="animate-spin text-muted-foreground" aria-label="Carregando" /></div>
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => {
    if (!current) return current
    const next = { ...current, [key]: value }
    // O endereço da página acompanha nome e % de cacau até ser editado à mão
    if (!slugTouched && (key === 'name' || key === 'cacao')) next.slug = slugify(`${next.name} ${next.cacao}`)
    return next
  })
  const text = (key: keyof Draft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, event.target.value as never)

  const cacao = Number(draft.cacao)
  const price = money(draft.price)
  const compareAt = draft.compareAt.trim() ? money(draft.compareAt) : undefined
  const errors = {
    name: !draft.name.trim() ? 'Dê um nome à barra.' : null,
    cacao: draft.cacao === '' || !Number.isInteger(cacao) || cacao < 0 || cacao > 100 ? 'De 0 a 100.' : null,
    slug: !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug) ? 'Use letras minúsculas, números e hífen.' : null,
    price: !(price >= 0) || draft.price.trim() === '' ? 'Informe o preço.' : null,
    compareAt: compareAt !== undefined && !(compareAt > price) ? 'O preço "de" precisa ser maior que o preço.' : null,
    short: !draft.short.trim() ? 'Uma frase sobre o sabor.' : null,
  }
  const show = (key: keyof typeof errors) => (tried ? errors[key] : null)

  const preview = {
    slug: draft.slug || 'nova-barra', name: draft.name || 'Nome da barra', cacao: Number.isFinite(cacao) ? cacao : 0, line: draft.line,
    label: draft.label, tile: draft.tile, labelText: draft.labelText, price: price || 0, compareAt, weight: draft.weight, short: draft.short,
    badge: (draft.badge || undefined) as ProductInput['badge'], soldOut: draft.soldOut, image: draft.image || undefined,
  }

  const onFile = async (file?: File | null) => {
    if (!file) return
    if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type)) return toast.error('Envie uma imagem PNG, JPG, WebP ou AVIF.')
    if (file.size > MAX_IMAGE) return toast.error('A imagem deve ter no máximo 4 MB.')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      uploaded.current.push(url)
      set('image', url)
      toast.success('Foto enviada. Salve para publicar.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar a foto.')
    }
    setUploading(false)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (Object.values(errors).some(Boolean)) {
      toast.error('Confira os campos destacados.')
      return
    }
    setSaving(true)
    try {
      const saved = await saveProduct({
        ...preview,
        id: draft.id,
        name: draft.name.trim(),
        slug: draft.slug,
        short: draft.short.trim(),
        description: draft.description.trim() || undefined,
        ingredients: draft.ingredients.trim() || undefined,
        weight: draft.weight.trim() || '70 g',
        active: draft.active,
        sortOrder: draft.sortOrder.trim() === '' ? 1000 : Number(draft.sortOrder) || 0,
        stock: draft.stock.trim() === '' ? undefined : Number(draft.stock),
      })
      // Fotos trocadas antes de salvar (e a antiga, se mudou) saem do armazenamento
      const keep = saved.image
      const stale = [...uploaded.current, original?.image].filter((url): url is string => Boolean(url) && url !== keep)
      uploaded.current = []
      await Promise.all(stale.map(deleteImage))
      await refreshStore().catch(() => toast.warning('Salvo. A loja pode levar alguns minutos para mostrar a mudança.'))
      toast.success(draft.id ? 'Barra atualizada.' : 'Barra criada.')
      const next = { ...draft, id: saved.id, sortOrder: String(saved.sortOrder) }
      setDraft(next)
      setOriginal(next)
      if (!draft.id) router.replace(`/admin/produtos/${saved.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
    setSaving(false)
  }

  const remove = async () => {
    if (!draft.id || !window.confirm(`Excluir ${draft.name}? Isso não pode ser desfeito. Para só tirar da loja, desligue "Visível na loja".`)) return
    try {
      await deleteProduct(draft.id)
      if (draft.image) await deleteImage(draft.image)
      await refreshStore().catch(() => {})
      toast.success('Barra excluída.')
      setOriginal(draft)
      router.replace('/admin/produtos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Link href="/admin/produtos" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft /> Produtos</Link>
      <AdminHeader
        title={draft.id ? `${original?.name} ${original?.cacao}%` : 'Nova barra'}
        description={dirty ? 'Alterações não salvas' : draft.id ? 'Tudo salvo' : 'Preencha e salve para publicar'}
        actions={<>
          {draft.id && <Button asChild variant="outline"><a href={`/produtos/${original?.slug}`} target="_blank" rel="noreferrer"><ArrowSquareOut /> Ver na loja</a></Button>}
          <Button type="submit" disabled={saving || uploading}>{saving && <CircleNotch className="animate-spin" />} Salvar</Button>
        </>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="font-display text-lg font-bold">Informações</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem_10rem]">
              <Field label="Nome" error={show('name')}><Input value={draft.name} onChange={text('name')} placeholder="Ex.: Cupuaçu" /></Field>
              <Field label="% de cacau" error={show('cacao')}><Input value={draft.cacao} onChange={(event) => set('cacao', event.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" /></Field>
              <Field label="Linha"><Select value={draft.line} onChange={text('line')}>{Object.entries(LINES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Endereço da página" error={show('slug')} hint={`/produtos/${draft.slug || '…'}`}>
                <Input value={draft.slug} onChange={(event) => { setSlugTouched(true); set('slug', slugify(event.target.value) + (event.target.value.endsWith('-') ? '-' : '')) }} />
              </Field>
              <Field label="Selo"><Select value={draft.badge} onChange={text('badge')}><option value="">Sem selo</option>{BADGES.map((badge) => <option key={badge}>{badge}</option>)}</Select></Field>
            </div>
            <Field className="mt-4" label="Frase curta" hint="Aparece no card da vitrine e no topo da página." error={show('short')}><Input value={draft.short} onChange={text('short')} maxLength={140} /></Field>
            <Field className="mt-4" label="Sobre o chocolate" hint="Texto completo da página. Se ficar vazio, usamos a frase curta."><Textarea value={draft.description} onChange={text('description')} rows={4} /></Field>
            <Field className="mt-4" label="Ingredientes e alérgicos"><Textarea value={draft.ingredients} onChange={text('ingredients')} rows={3} placeholder="Massa de cacau, açúcar, … ALÉRGICOS: CONTÉM LEITE." /></Field>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-bold">Preço</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Preço (R$)" error={show('price')}><Input value={draft.price} onChange={(event) => set('price', event.target.value.replace(/[^\d,]/g, ''))} inputMode="decimal" placeholder="32,70" /></Field>
              <Field label="Preço “de” (R$)" hint="Opcional, aparece riscado." error={show('compareAt')}><Input value={draft.compareAt} onChange={(event) => set('compareAt', event.target.value.replace(/[^\d,]/g, ''))} inputMode="decimal" placeholder="35,00" /></Field>
              <Field label="Peso"><Input value={draft.weight} onChange={text('weight')} placeholder="70 g" /></Field>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-bold">Foto e cores</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sem foto, a loja desenha a embalagem com as cores abaixo. Para a foto, use PNG com fundo transparente, na vertical (proporção 311 × 405).</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_1fr]">
              <div
                onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files[0]) }}
                className={cn('relative grid aspect-[311/405] place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors', dragging && 'border-foreground bg-secondary')}
                style={draft.image ? { background: draft.tile } : undefined}
              >
                {draft.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.image} alt="Foto atual" className="size-full object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 p-4 text-center text-xs text-muted-foreground"><ImageIcon size={28} /> Arraste a foto aqui</span>
                )}
                {uploading && <span className="absolute inset-0 grid place-items-center bg-background/70"><CircleNotch size={28} className="animate-spin" /></span>}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = '' }} />
                  <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}><UploadSimple /> {draft.image ? 'Trocar foto' : 'Enviar foto'}</Button>
                  {draft.image && <Button type="button" variant="ghost" onClick={() => set('image', '')}><Trash /> Usar embalagem desenhada</Button>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="Cor da etiqueta" value={draft.label} onChange={(value) => set('label', value)} />
                  <ColorField label="Fundo na vitrine" value={draft.tile} onChange={(value) => set('tile', value)} />
                </div>
                <fieldset>
                  <legend className="text-sm font-semibold">Texto da etiqueta</legend>
                  <div className="mt-2 flex gap-2">
                    {(['dark', 'light'] as const).map((tone) => (
                      <label key={tone} className={cn('flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold has-[:checked]:border-foreground has-[:checked]:bg-secondary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-foreground/10')}>
                        <input type="radio" name="labelText" value={tone} checked={draft.labelText === tone} onChange={() => set('labelText', tone)} className="sr-only" />
                        <span className={cn('size-4 rounded-full border', tone === 'dark' ? 'bg-[#1d1d1b]' : 'bg-white')} /> {tone === 'dark' ? 'Escuro' : 'Claro'}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
          <Panel>
            <h2 className="font-display text-lg font-bold">Na loja</h2>
            <div className="mt-4 flex flex-col gap-4">
              <label className="flex items-center justify-between gap-3 text-sm font-semibold">Visível na loja <Switch checked={draft.active} onChange={(value) => set('active', value)} label="Visível na loja" /></label>
              <label className="flex items-center justify-between gap-3 text-sm font-semibold">Esgotada <Switch checked={draft.soldOut} onChange={(value) => set('soldOut', value)} label="Esgotada" tone="danger" /></label>
              <Field label="Estoque" hint={draft.stock === '0' ? 'Zerado: a barra aparece como esgotada.' : 'Vazio = não controla. Cada venda desconta daqui.'}><Input value={draft.stock} onChange={(event) => set('stock', event.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" placeholder="Sem controle" /></Field>
              <Field label="Ordem na vitrine" hint="Menor aparece primeiro. Os 14 primeiros formam o mosaico da home."><Input value={draft.sortOrder} onChange={(event) => set('sortOrder', event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Último" /></Field>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-bold">Prévia</h2>
            <div className="relative mt-4 overflow-hidden rounded-2xl" style={{ background: preview.tile }}>
              {preview.badge && <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider">{preview.badge}</span>}
              <BarPackage product={preview} className={cn(preview.soldOut && 'opacity-60')} />
            </div>
            <p className="mt-3 font-display font-bold">{preview.name} {preview.cacao}%</p>
            <p className="text-sm text-muted-foreground">{preview.short || 'Frase curta da barra'}</p>
            <p className="mt-1 text-sm">{compareAt && <s className="mr-2 text-muted-foreground">{formatBRL(compareAt)}</s>}<strong>{preview.soldOut ? 'Esgotado' : formatBRL(preview.price)}</strong></p>
          </Panel>

          {draft.id && <Button type="button" variant="ghost" className="self-start text-destructive" onClick={remove}><Trash /> Excluir barra</Button>}
        </div>
      </div>
    </form>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [textValue, setTextValue] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  // Mantém o campo de texto em sincronia quando a cor muda pelo seletor
  if (value !== lastValue) {
    setLastValue(value)
    setTextValue(value)
  }
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} (seletor)`} className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border bg-background p-1" />
        <Input
          id={id}
          value={textValue}
          onChange={(event) => {
            const next = event.target.value.trim()
            setTextValue(next)
            if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next.toLowerCase())
          }}
          maxLength={7}
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}
