// Tipos e regras do catálogo de barras.
// O catálogo de verdade vem do banco (tabela products, editável em /admin).
// A lista abaixo é a reserva: usada quando o site roda sem banco configurado
// (CI, primeiro `yarn dev`) ou se a Data API estiver fora do ar.

export type Line = 'intensos' | 'ao-leite' | 'brancos'

export type Product = {
  id?: number
  slug: string
  name: string
  cacao: number
  line: Line
  /** cor da etiqueta da embalagem */
  label: string
  /** cor de fundo do bloco na vitrine */
  tile: string
  /** texto da etiqueta escuro ou claro */
  labelText?: 'dark' | 'light'
  price: number
  compareAt?: number
  weight: string
  short: string
  description?: string
  ingredients?: string
  badge?: (typeof BADGES)[number]
  soldOut?: boolean
  /** vazio = estoque não controlado */
  stock?: number
  image?: string
}

export const LINE_SINGULAR: Record<Line, string> = { intensos: 'intenso', 'ao-leite': 'ao leite', brancos: 'branco' }

export const LINES: Record<Line, string> = {
  intensos: 'Intensos',
  'ao-leite': 'Ao leite',
  brancos: 'Brancos',
}

const base = { price: 32.7, compareAt: 35, weight: '70 g' }

export const FALLBACK_PRODUCTS: Product[] = [
  { ...base, slug: 'guru-60', name: 'Guru', cacao: 60, line: 'intensos', label: '#151515', tile: '#c9a54c', labelText: 'light', short: 'Edição limitada para quem gosta de descobrir.', badge: 'Edição limitada' },
  { ...base, slug: 'acai-37', name: 'Açaí', cacao: 37, line: 'brancos', label: '#5b3a8e', tile: '#6c3f99', labelText: 'light', short: 'Chocolate branco com açaí da Amazônia.' },
  { ...base, slug: 'cumaru-55', name: 'Cumaru', cacao: 55, line: 'ao-leite', label: '#1f7fc1', tile: '#1c7cbf', short: 'Ao leite com cumaru, a "baunilha brasileira".' },
  { ...base, slug: 'zero-acucar-cumaru-55', name: 'Cumaru zero açúcar', cacao: 55, line: 'ao-leite', label: '#151515', tile: '#1c7cbf', labelText: 'light', short: '55% ao leite com cumaru, sem adição de açúcar.', badge: 'Zero açúcar' },
  { ...base, slug: 'caipira-37', name: 'Caipira', cacao: 37, line: 'brancos', label: '#3aa55a', tile: '#3ea85c', short: 'Branco com milho e especiarias. Festa junina em barra.' },
  { ...base, slug: 'chocada-55', name: 'Chocada', cacao: 55, line: 'ao-leite', label: '#c6342b', tile: '#df8a2c', labelText: 'light', short: 'Ao leite com doce de leite e crocante.' },
  { ...base, slug: 'nibs-37', name: 'Branco com nibs', cacao: 37, line: 'brancos', label: '#e8b630', tile: '#efb72d', short: 'Branco com nibs de cacau e açúcar mascavo.', image: '/images/produtos/branco-nibs-37.png' },
  { ...base, slug: 'pingado-55', name: 'Pingado', cacao: 55, line: 'ao-leite', label: '#b58a4f', tile: '#c49d61', short: 'Ao leite com café: o pingado da padaria.' },
  { ...base, slug: 'castanha-64', name: 'Castanha e flor de sal', cacao: 64, line: 'intensos', label: '#e2708e', tile: '#eba3ad', short: 'Castanha de caju e flor de sal.', image: '/images/produtos/castanha-flor-de-sal-64.png' },
  { ...base, slug: 'cupuacu-64', name: 'Cupuaçu', cacao: 64, line: 'intensos', label: '#e47a24', tile: '#e37a2f', short: 'O primo amazônico do cacau, ácido e frutado.', image: '/images/produtos/cupuacu-64.png' },
  { ...base, slug: 'cafezinho-64', name: 'Cafezinho', cacao: 64, line: 'intensos', label: '#5f7a2a', tile: '#6c7f31', labelText: 'light', short: 'Intenso com café, para depois do almoço.' },
  { ...base, slug: 'pao-de-mel-64', name: 'Pão de mel', cacao: 64, line: 'intensos', label: '#8f78bf', tile: '#9d87c8', short: 'Intenso com especiarias de pão de mel.' },
  { ...base, slug: 'intenso-71', name: 'Intenso', cacao: 71, line: 'intensos', label: '#d01b2e', tile: '#de2f35', labelText: 'light', short: 'Só cacau da Bahia e açúcar.', image: '/images/produtos/intenso-71.png' },
  { ...base, slug: 'prodigio-64', name: 'Prodígio', cacao: 64, line: 'intensos', label: '#151515', tile: '#c9a54c', labelText: 'light', short: 'Edição limitada com coco.', badge: 'Edição limitada', soldOut: true },
]

export const BADGES = ['Edição limitada', 'Zero açúcar', 'Novo'] as const

export const findProduct = (list: Product[], slug: string) => list.find((product) => product.slug === slug)

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const installment = (value: number, times = 7) => formatBRL(value / times)

export const SORTS = {
  relevancia: 'Mais relevantes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'mais-cacau': 'Mais cacau',
  'menos-cacau': 'Menos cacau',
} as const
export type Sort = keyof typeof SORTS

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Filtro do catálogo: linha, busca por texto e ordenação (esgotados por último)
export function filterProducts(products: Product[], { line, search, sort = 'relevancia' }: { line?: string; search?: string; sort?: string }) {
  const term = search ? normalize(search.trim()) : ''
  const list = products.filter((product) => {
    if (line && line in LINES && product.line !== line) return false
    if (term && !normalize(`${product.name} ${product.short} ${product.cacao}`).includes(term)) return false
    return true
  })
  const compare: Record<string, (a: Product, b: Product) => number> = {
    'menor-preco': (a, b) => a.price - b.price,
    'maior-preco': (a, b) => b.price - a.price,
    'mais-cacau': (a, b) => b.cacao - a.cacao,
    'menos-cacau': (a, b) => a.cacao - b.cacao,
  }
  const sorted = compare[sort] ? [...list].sort(compare[sort]) : list
  return sorted.sort((a, b) => Number(Boolean(a.soldOut)) - Number(Boolean(b.soldOut)))
}
