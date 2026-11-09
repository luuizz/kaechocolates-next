import { z } from 'zod'
import { CART_MAX_LINES, KIT_MAX_BARS, KIT_MESSAGE_MAX, KIT_NAME_MAX, MAX_PER_ITEM } from '@/constants/limits'
import { SLUG_PATTERN } from '@/constants/patterns'

// Formato da sacola que chega do navegador. Os preços NÃO vêm daqui:
// o banco recalcula tudo em quote_order/place_order.
const slug = z.string().regex(SLUG_PATTERN)
const quantity = z
  .unknown()
  .optional()
  .transform((value) => Math.min(MAX_PER_ITEM, Math.max(1, Math.floor(Number(value) || 1))))
const optionalText = (max: number) =>
  z
    .unknown()
    .optional()
    .transform((value) => (typeof value === 'string' ? value.slice(0, max) : undefined))

const kitItem = z.object({
  kind: z.literal('kit'),
  box: slug,
  slugs: z.array(slug).max(KIT_MAX_BARS),
  name: optionalText(KIT_NAME_MAX),
  message: optionalText(KIT_MESSAGE_MAX),
  quantity,
})

const productItem = z.object({
  kind: z
    .unknown()
    .optional()
    .transform(() => 'product' as const),
  slug,
  quantity,
})

export const cartSchema = z
  .array(z.union([kitItem, productItem]))
  .min(1)
  .max(CART_MAX_LINES)

export type CartInput = z.output<typeof cartSchema>[number]
