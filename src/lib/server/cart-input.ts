import 'server-only'
// Valida o formato da sacola que chega do navegador (os preços NÃO vêm daqui:
// o banco recalcula tudo em quote_order/place_order)
export type CartInput =
  | { kind: 'product'; slug: string; quantity: number }
  | { kind: 'kit'; name?: string; box: string; slugs: string[]; message?: string; quantity: number }

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function parseCart(value: unknown): CartInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null
  const items: CartInput[] = []
  for (const raw of value) {
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(raw?.quantity) || 1)))
    if (raw?.kind === 'kit') {
      if (typeof raw.box !== 'string' || !SLUG.test(raw.box) || !Array.isArray(raw.slugs) || raw.slugs.length > 24 || !raw.slugs.every((slug: unknown) => typeof slug === 'string' && SLUG.test(slug))) return null
      items.push({ kind: 'kit', box: raw.box, slugs: raw.slugs, quantity, name: typeof raw.name === 'string' ? raw.name.slice(0, 80) : undefined, message: typeof raw.message === 'string' ? raw.message.slice(0, 200) : undefined })
    } else {
      if (typeof raw?.slug !== 'string' || !SLUG.test(raw.slug)) return null
      items.push({ kind: 'product', slug: raw.slug, quantity })
    }
  }
  return items
}
