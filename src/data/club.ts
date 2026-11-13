import { roundMoney } from '@/lib/utils'
import type { Period, Plan } from '@/types/club'

export const FALLBACK_PLANS: Plan[] = [
  {
    id: 'degustacao',
    name: 'Degustação',
    bars: 2,
    price: 59.9,
    color: '#efb72d',
    pitch: 'Para conhecer a Kaê sem pressa.',
    perks: ['2 barras por mês', 'Ficha de degustação', 'Frete grátis'],
  },
  {
    id: 'chocolatra',
    name: 'Chocólatra',
    bars: 4,
    price: 109.9,
    color: '#e2708e',
    pitch: 'O equilíbrio perfeito entre novidade e favoritos.',
    perks: ['4 barras por mês', '1 edição limitada por caixa', 'Ficha de degustação', 'Frete grátis'],
    featured: true,
  },
  {
    id: 'familia',
    name: 'Família',
    bars: 6,
    price: 159.9,
    color: '#1c7cbf',
    pitch: 'Para dividir em casa (ou não).',
    perks: [
      '6 barras por mês',
      '2 edições limitadas por caixa',
      'Ficha de degustação',
      'Frete grátis',
      '10% off na loja',
    ],
  },
]

export const FALLBACK_PERIODS: Period[] = [
  { id: 'mensal', label: 'Mensal', months: 1, discount: 0, note: 'Cancele quando quiser' },
  { id: 'trimestral', label: 'Trimestral', months: 3, discount: 0.05, note: '5% off' },
  { id: 'semestral', label: 'Semestral', months: 6, discount: 0.1, note: '10% off' },
]

export function planPrice(plan: Plan, period: Period) {
  const monthly = roundMoney(plan.price * (1 - period.discount))
  return { monthly, total: roundMoney(monthly * period.months), period }
}

export const CLUB_FAQ = [
  {
    q: 'Quando a caixa chega?',
    a: 'As caixas são enviadas na primeira quinzena de cada mês. Você recebe o código de rastreio por e-mail assim que ela sai.',
  },
  {
    q: 'Posso pausar ou cancelar?',
    a: 'No plano mensal, sim, a qualquer momento pela sua conta, sem multa. Nos planos trimestral e semestral, o cancelamento vale ao fim do período já pago.',
  },
  {
    q: 'Posso escolher os sabores?',
    a: 'A graça do clube é a surpresa: a seleção é montada pela Kaê. Se tiver alguma restrição (lactose, castanhas), avise no cadastro e a gente adapta.',
  },
  {
    q: 'Dá para dar o clube de presente?',
    a: 'Dá! Escolha o plano trimestral ou semestral e informe o endereço de quem vai receber. A primeira caixa vai com um cartão escrito à mão.',
  },
  {
    q: 'Como é feita a cobrança?',
    a: 'Pelo Mercado Pago, no cartão de crédito. No mensal, a cobrança é todo mês; nos outros, o valor do período pode ser parcelado.',
  },
]
