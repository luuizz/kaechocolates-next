import { findProduct, type Product } from './products'

// Caixas do "Monte seu kit". Tamanhos e descontos provisórios (definir com a Kaê).
export const BOXES = [
  { id: 'p', name: 'Caixa P', size: 3, discount: 0.05, note: 'Para provar' },
  { id: 'm', name: 'Caixa M', size: 6, discount: 0.08, note: 'A mais pedida' },
  { id: 'g', name: 'Caixa G', size: 9, discount: 0.12, note: 'Para chocólatras' },
] as const
export type BoxId = (typeof BOXES)[number]['id']
export const findBox = (id: BoxId) => BOXES.find((box) => box.id === id)!

export type KitSpec = { name: string; box: BoxId; slugs: string[]; message?: string }

const round = (value: number) => Math.round(value * 100) / 100

export function kitTotals(spec: Pick<KitSpec, 'box' | 'slugs'>) {
  const products = spec.slugs.map((slug) => findProduct(slug)).filter(Boolean) as Product[]
  const subtotal = round(products.reduce((total, product) => total + product.price, 0))
  const discount = round(subtotal * findBox(spec.box).discount)
  return { products, subtotal, discount, total: round(subtotal - discount) }
}

// Kit pronto com as barras mais premiadas (seleção provisória)
export const AWARD_KIT: KitSpec = {
  name: 'Kit dos premiados',
  box: 'm',
  slugs: ['intenso-71', 'cupuacu-64', 'castanha-64', 'cumaru-55', 'caipira-37', 'acai-37'],
}
