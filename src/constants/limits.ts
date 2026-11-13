export const CART_MAX_LINES = 50
export const MAX_PER_ITEM = 20
export const KIT_MAX_BARS = 24
export const KIT_NAME_MAX = 80
export const KIT_MESSAGE_MAX = 200

export const PASSWORD_MIN = 8

// Corpo das funções da Vercel vai até 4,5 MB
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024
export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
export const IMAGE_FOLDER = 'produtos'
