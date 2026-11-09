import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Junta classes do Tailwind resolvendo conflitos (padrão do shadcn/ui)
// Tokens próprios de globals.css: sem isso o merge confunde text-2xs com cor de texto
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs'],
      radius: ['tile', 'card', 'feature', 'hero'],
      tracking: ['display', 'heading', 'eyebrow'],
      leading: ['display'],
      aspect: ['package'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Texto livre → código de URL ("Pão de mel 64" → "pao-de-mel-64")
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Telefone brasileiro com DDD: 35984773733 → (35) 98477-3733
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Arredonda dinheiro em centavos como o Postgres (round(numeric, 2)), sem o erro
// de ponto flutuante do JS: 104.405 vira 104.41, não 104.40
export const roundMoney = (value: number) => Math.round(Number((value * 100).toFixed(6))) / 100
