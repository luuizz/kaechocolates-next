import type { Period, Plan } from './club'
import type { Box } from './kit'
import type { Product } from './product'

export type Catalog = {
  products: Product[]
  boxes: Box[]
  plans: Plan[]
  periods: Period[]
  /** de onde veio: banco ou lista reserva do código */
  source: 'db' | 'fallback'
}
