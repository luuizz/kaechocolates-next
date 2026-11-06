import type { Line, Product } from '@/data/products'

// Linhas como vêm da Data API (snake_case, numeric chega como número ou texto)
export type ProductRow = {
  id: number; slug: string; name: string; cacao: number; line: Line
  label_color: string; tile_color: string; label_text: 'dark' | 'light'
  price: number | string; compare_at_price: number | string | null; weight: string
  short: string; description: string | null; ingredients: string | null
  badge: Product['badge'] | null; sold_out: boolean; image: string | null; stock?: number | null
}

export const productFromRow = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  cacao: row.cacao,
  line: row.line,
  label: row.label_color,
  tile: row.tile_color,
  labelText: row.label_text,
  price: Number(row.price),
  compareAt: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
  weight: row.weight,
  short: row.short,
  description: row.description ?? undefined,
  ingredients: row.ingredients ?? undefined,
  badge: row.badge ?? undefined,
  soldOut: row.sold_out || row.stock === 0,
  stock: row.stock ?? undefined,
  image: row.image ?? undefined,
})

