import { roundMoney } from '@/lib/utils'
import { findProduct } from './products'
import type { Box, KitSpec } from '@/types/kit'
import type { Product } from '@/types/product'

export const FALLBACK_BOXES: Box[] = [
  { id: 'p', name: 'Caixa P', size: 3, discount: 0.05, note: 'Para provar' },
  { id: 'm', name: 'Caixa M', size: 6, discount: 0.08, note: 'A mais pedida' },
  { id: 'g', name: 'Caixa G', size: 9, discount: 0.12, note: 'Para chocólatras' },
]

export const findBox = (boxes: Box[], id: string) => boxes.find((box) => box.id === id)

const round = roundMoney

export function kitTotals(spec: Pick<KitSpec, 'box' | 'slugs'>, catalog: { products: Product[]; boxes: Box[] }) {
  const products = spec.slugs.map((slug) => findProduct(catalog.products, slug)).filter(Boolean) as Product[]
  const subtotal = round(products.reduce((total, product) => total + product.price, 0))
  const discount = round(subtotal * (findBox(catalog.boxes, spec.box)?.discount ?? 0))
  return { products, subtotal, discount, total: round(subtotal - discount) }
}

export const AWARD_KIT: KitSpec = {
  name: 'Kit dos premiados',
  box: 'm',
  slugs: ['intenso-71', 'cupuacu-64', 'castanha-64', 'cumaru-55', 'caipira-37', 'acai-37'],
}
