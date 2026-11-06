// Catálogo provisório (vira tabela no Neon na fase 2, editável pelo painel).
// Sabores, preços e linhas do site atual da Kaê. As descrições curtas vêm das
// pistas do site; textos completos e ingredientes precisam ser conferidos com a Kaê.

export type Line = 'intensos' | 'ao-leite' | 'brancos'

export type Product = {
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
  badge?: 'Edição limitada' | 'Zero açúcar' | 'Novo'
  soldOut?: boolean
  image?: string
}

export const LINES: Record<Line, string> = {
  intensos: 'Intensos',
  'ao-leite': 'Ao leite',
  brancos: 'Brancos',
}

const base = { price: 32.7, compareAt: 35, weight: '70 g' }

export const products: Product[] = [
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

export const findProduct = (slug: string) => products.find((product) => product.slug === slug)

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const installment = (value: number, times = 7) => formatBRL(value / times)
