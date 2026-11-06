import { unstable_cache } from 'next/cache'
import { FALLBACK_PRODUCTS, type Product } from '@/data/products'
import { FALLBACK_BOXES, type Box } from '@/data/kits'
import { FALLBACK_PERIODS, FALLBACK_PLANS, type Period, type Plan } from '@/data/club'
import { neonEnv } from '@/lib/env'
import { productFromRow, type ProductRow } from '@/lib/catalog-rows'

export type Catalog = {
  products: Product[]
  boxes: Box[]
  plans: Plan[]
  periods: Period[]
  /** de onde veio: banco ou lista reserva do código */
  source: 'db' | 'fallback'
}

export const CATALOG_TAG = 'catalog'

const FALLBACK: Catalog = {
  products: FALLBACK_PRODUCTS,
  boxes: FALLBACK_BOXES,
  plans: FALLBACK_PLANS,
  periods: FALLBACK_PERIODS,
  source: 'fallback',
}

// O visitante não tem login: o Neon Auth entrega um token "anonymous", que só
// lê o que as políticas do banco liberam (itens ativos do catálogo).
async function anonymousToken(authUrl: string) {
  const response = await fetch(`${authUrl}/token/anonymous`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`token anônimo: HTTP ${response.status}`)
  const { token } = (await response.json()) as { token: string }
  return token
}

async function loadCatalog(): Promise<Catalog> {
  const { authUrl, dataApiUrl } = neonEnv()
  if (!authUrl || !dataApiUrl) return FALLBACK

  try {
    const token = await anonymousToken(authUrl)
    const get = async <T,>(path: string): Promise<T[]> => {
      const response = await fetch(`${dataApiUrl}/${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status} ${await response.text()}`)
      return response.json()
    }
    const order = 'order=sort_order.asc'
    const [products, boxes, plans, periods] = await Promise.all([
      get<ProductRow>(`products?select=*&active=is.true&${order},id.asc`),
      get<Box & { discount: number | string }>(`kit_boxes?select=id,name,size,discount,note&active=is.true&${order}`),
      get<Plan & { price: number | string }>(`club_plans?select=id,name,bars,price,color,pitch,perks,featured&active=is.true&${order}`),
      get<Period & { discount: number | string }>(`club_periods?select=id,label,months,discount,note&active=is.true&${order}`),
    ])
    return {
      products: products.map(productFromRow),
      boxes: boxes.map((box) => ({ ...box, discount: Number(box.discount), note: box.note ?? undefined })),
      plans: plans.map((plan) => ({ ...plan, price: Number(plan.price) })),
      periods: periods.map((period) => ({ ...period, discount: Number(period.discount), note: period.note ?? undefined })),
      source: 'db',
    }
  } catch (error) {
    // Sem banco o site continua de pé com o catálogo do código
    console.error('[catálogo] usando a lista reserva:', error instanceof Error ? error.message : error)
    return FALLBACK
  }
}

// Guardado em cache por 5 minutos; o painel limpa na hora ao salvar (/api/revalidate)
export const getCatalog = unstable_cache(loadCatalog, ['catalog-v1'], { tags: [CATALOG_TAG], revalidate: 300 })
