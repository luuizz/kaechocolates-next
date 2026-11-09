import { z } from 'zod'

// Formato da sacola que chega do navegador. Os preços NÃO vêm daqui:
// o banco recalcula tudo em quote_order/place_order.
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
const quantity = z.unknown().optional().transform((value) => Math.min(20, Math.max(1, Math.floor(Number(value) || 1))))
const optionalText = (max: number) => z.unknown().optional().transform((value) => (typeof value === 'string' ? value.slice(0, max) : undefined))

const kitItem = z.object({
  kind: z.literal('kit'),
  box: slug,
  slugs: z.array(slug).max(24),
  name: optionalText(80),
  message: optionalText(200),
  quantity,
})

const productItem = z.object({
  kind: z.unknown().optional().transform(() => 'product' as const),
  slug,
  quantity,
})

export const cartSchema = z.array(z.union([kitItem, productItem])).min(1).max(50)

export type CartInput = z.output<typeof cartSchema>[number]
