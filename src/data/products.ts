// Catálogo provisório (vira tabela no Neon na fase 2, editável pelo painel).
// Preços e nomes do site atual da Kaê; descrições e ingredientes são provisórios
// (conferir com a Kaê antes de publicar).

export type Flavor = 'yellow' | 'blue' | 'pink' | 'orange' | 'red'
export type Line = 'intensos' | 'ao-leite' | 'brancos'

export type Product = {
  slug: string
  name: string
  fullName: string
  cacao: number
  line: Line
  flavor: Flavor
  price: number
  compareAt?: number
  weight: string
  image: string
  description: string
  ingredients: string
  allergens: string
  free: Array<'gluten' | 'conservantes' | 'aromatizantes' | 'lactose'>
}

export const flavorClass: Record<Flavor, { bg: string; text: string; soft: string }> = {
  yellow: { bg: 'bg-flavor-yellow', text: 'text-flavor-yellow', soft: 'bg-flavor-yellow/15' },
  blue: { bg: 'bg-flavor-blue', text: 'text-flavor-blue', soft: 'bg-flavor-blue/15' },
  pink: { bg: 'bg-flavor-pink', text: 'text-flavor-pink', soft: 'bg-flavor-pink/15' },
  orange: { bg: 'bg-flavor-orange', text: 'text-flavor-orange', soft: 'bg-flavor-orange/15' },
  red: { bg: 'bg-flavor-red', text: 'text-flavor-red', soft: 'bg-flavor-red/15' },
}

export const products: Product[] = [
  {
    slug: 'branco-com-nibs-37',
    name: 'Branco com nibs',
    fullName: 'Chocolate branco com nibs 37%',
    cacao: 37,
    line: 'brancos',
    flavor: 'yellow',
    price: 32.7,
    compareAt: 35,
    weight: '67 g',
    image: '/images/produtos/branco-nibs-37.png',
    description: 'Manteiga de cacau, nibs crocantes e açúcar mascavo. Doce na medida, com textura de verdade.',
    ingredients: 'Manteiga de cacau, açúcar orgânico, leite, nibs de cacau e muito axé.',
    allergens: 'Não contém glúten. Contém lactose. Pode conter traços de castanha.',
    free: ['gluten', 'conservantes', 'aromatizantes'],
  },
  {
    slug: 'ao-leite-48',
    name: 'Ao leite',
    fullName: 'Chocolate ao leite 48%',
    cacao: 48,
    line: 'ao-leite',
    flavor: 'blue',
    price: 32.7,
    compareAt: 35,
    weight: '67 g',
    image: '/images/produtos/ao-leite-48.png',
    description: 'O ao leite que lembra infância, só que com cacau de verdade e bem menos açúcar.',
    ingredients: 'Cacau, açúcar orgânico, manteiga de cacau e leite.',
    allergens: 'Não contém glúten. Contém lactose. Pode conter traços de castanha.',
    free: ['gluten', 'conservantes', 'aromatizantes'],
  },
  {
    slug: 'castanha-e-flor-de-sal-64',
    name: 'Castanha e flor de sal',
    fullName: 'Chocolate com castanha de caju e flor de sal 64%',
    cacao: 64,
    line: 'intensos',
    flavor: 'pink',
    price: 32.7,
    compareAt: 35,
    weight: '67 g',
    image: '/images/produtos/castanha-flor-de-sal-64.png',
    description: 'Castanha de caju tostada e um toque de flor de sal que acorda o cacau.',
    ingredients: 'Cacau, açúcar orgânico, manteiga de cacau, castanha de caju e flor de sal.',
    allergens: 'Não contém glúten. Contém castanha de caju.',
    free: ['gluten', 'conservantes', 'lactose'],
  },
  {
    slug: 'cupuacu-64',
    name: 'Cupuaçu',
    fullName: 'Chocolate com cupuaçu 64%',
    cacao: 64,
    line: 'intensos',
    flavor: 'orange',
    price: 32.7,
    compareAt: 35,
    weight: '67 g',
    image: '/images/produtos/cupuacu-64.png',
    description: 'O primo amazônico do cacau entra na barra: ácido, frutado e inesquecível.',
    ingredients: 'Cacau, açúcar orgânico, manteiga de cacau e cupuaçu.',
    allergens: 'Não contém glúten. Pode conter traços de leite e castanha.',
    free: ['gluten', 'conservantes', 'lactose'],
  },
  {
    slug: 'intenso-71',
    name: 'Intenso',
    fullName: 'Chocolate intenso 71%',
    cacao: 71,
    line: 'intensos',
    flavor: 'red',
    price: 32.7,
    compareAt: 35,
    weight: '67 g',
    image: '/images/produtos/intenso-71.png',
    description: 'Só cacau da Bahia e açúcar. Para quem quer sentir o grão inteiro na boca.',
    ingredients: 'Cacau e açúcar orgânico.',
    allergens: 'Não contém glúten nem lactose. Pode conter traços de castanha.',
    free: ['gluten', 'conservantes', 'lactose'],
  },
]

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const installment = (value: number, times = 7) => formatBRL(value / times)
