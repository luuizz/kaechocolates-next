import type { SORTS } from '@/constants/catalog'

export type Line = 'intensos' | 'ao-leite' | 'brancos'

export type ProductBadge = 'Edição limitada' | 'Zero açúcar' | 'Novo'

export type Product = {
  id?: number
  slug: string
  name: string
  cacao: number
  line: Line
  /** cor da etiqueta da embalagem */
  label: string
  /** cor de fundo do bloco na vitrine */
  tile: string
  /** texto da etiqueta escuro ou claro */
  labelText?: 'dark' | 'light'
  price: number
  compareAt?: number
  weight: string
  short: string
  description?: string
  ingredients?: string
  badge?: ProductBadge
  soldOut?: boolean
  /** vazio = estoque não controlado */
  stock?: number
  image?: string
  packageNote?: string
  highSugar?: boolean
  highFat?: boolean
}

export type ProductRow = {
  id: number
  slug: string
  name: string
  cacao: number
  line: Line
  label_color: string
  tile_color: string
  label_text: 'dark' | 'light'
  price: number | string
  compare_at_price: number | string | null
  weight: string
  short: string
  description: string | null
  ingredients: string | null
  badge: Product['badge'] | null
  sold_out: boolean
  image: string | null
  stock?: number | null
  package_note?: string | null
  high_sugar?: boolean
  high_fat?: boolean
}

// soldOut = marcada OU estoque zerado; soldOutFlag = só a marcação manual
export type AdminProduct = Product & {
  id: number
  active: boolean
  sortOrder: number
  updatedAt: string
  soldOutFlag: boolean
}

export type ProductInput = Omit<AdminProduct, 'id' | 'updatedAt' | 'soldOutFlag'> & { id?: number }

export type Sort = keyof typeof SORTS
