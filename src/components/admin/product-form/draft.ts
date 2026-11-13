import type { AdminProduct, Line, ProductInput } from '@/types/product'
import { SLUG_PATTERN } from '@/constants/patterns'

export type Draft = {
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

export type SetField = <K extends keyof Draft>(key: K, value: Draft[K]) => void

export const EMPTY_DRAFT: Draft = {
  name: '',
  cacao: '',
  line: 'intensos',
  slug: '',
  price: '',
  compareAt: '',
  weight: '70 g',
  badge: '',
  short: '',
  description: '',
  ingredients: '',
  label: '#e8b630',
  tile: '#efb72d',
  labelText: 'dark',
  image: '',
  active: true,
  soldOut: false,
  sortOrder: '',
  stock: '',
}

const money = (value: string) => Number(value.replace(/\./g, '').replace(',', '.'))
const toMoney = (value?: number) => (value === undefined ? '' : value.toFixed(2).replace('.', ','))

export const draftFromProduct = (product: AdminProduct): Draft => ({
  id: product.id,
  name: product.name,
  cacao: String(product.cacao),
  line: product.line,
  slug: product.slug,
  price: toMoney(product.price),
  compareAt: toMoney(product.compareAt),
  weight: product.weight,
  badge: product.badge ?? '',
  short: product.short,
  description: product.description ?? '',
  ingredients: product.ingredients ?? '',
  label: product.label,
  tile: product.tile,
  labelText: product.labelText ?? 'dark',
  image: product.image ?? '',
  active: product.active,
  soldOut: product.soldOutFlag,
  sortOrder: String(product.sortOrder),
  stock: product.stock === undefined ? '' : String(product.stock),
})

export function validateDraft(draft: Draft) {
  const cacao = Number(draft.cacao)
  const price = money(draft.price)
  const compareAt = draft.compareAt.trim() ? money(draft.compareAt) : undefined
  return {
    name: !draft.name.trim() ? 'Dê um nome à barra.' : null,
    cacao: draft.cacao === '' || !Number.isInteger(cacao) || cacao < 0 || cacao > 100 ? 'De 0 a 100.' : null,
    slug: !SLUG_PATTERN.test(draft.slug) ? 'Use letras minúsculas, números e hífen.' : null,
    price: !(price >= 0) || draft.price.trim() === '' ? 'Informe o preço.' : null,
    compareAt: compareAt !== undefined && !(compareAt > price) ? 'O preço "de" precisa ser maior que o preço.' : null,
    short: !draft.short.trim() ? 'Uma frase sobre o sabor.' : null,
  }
}

export type DraftErrors = ReturnType<typeof validateDraft>

export function previewFromDraft(draft: Draft) {
  const cacao = Number(draft.cacao)
  return {
    slug: draft.slug || 'nova-barra',
    name: draft.name || 'Nome da barra',
    cacao: Number.isFinite(cacao) ? cacao : 0,
    line: draft.line,
    label: draft.label,
    tile: draft.tile,
    labelText: draft.labelText,
    price: money(draft.price) || 0,
    compareAt: draft.compareAt.trim() ? money(draft.compareAt) : undefined,
    weight: draft.weight,
    short: draft.short,
    badge: (draft.badge || undefined) as ProductInput['badge'],
    soldOut: draft.soldOut,
    image: draft.image || undefined,
  }
}

export type DraftPreview = ReturnType<typeof previewFromDraft>

export const inputFromDraft = (draft: Draft): ProductInput => ({
  ...previewFromDraft(draft),
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
