import type { Line, Product, ProductRow } from '@/types/product'

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

