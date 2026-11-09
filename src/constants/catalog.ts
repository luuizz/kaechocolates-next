import type { Line, ProductBadge } from '@/types/product'

export const LINES: Record<Line, string> = {
  intensos: 'Intensos',
  'ao-leite': 'Ao leite',
  brancos: 'Brancos',
}

export const LINE_SINGULAR: Record<Line, string> = { intensos: 'intenso', 'ao-leite': 'ao leite', brancos: 'branco' }

export const BADGES = ['Edição limitada', 'Zero açúcar', 'Novo'] as const satisfies readonly ProductBadge[]

export const SORTS = {
  relevancia: 'Mais relevantes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'mais-cacau': 'Mais cacau',
  'menos-cacau': 'Menos cacau',
} as const

// Tag do cache do catálogo; o painel limpa ao salvar
export const CATALOG_TAG = 'catalog'
