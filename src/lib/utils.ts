import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Sem isso o merge confunde tokens próprios (text-2xs) com cor de texto
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs'],
      radius: ['tile', 'card', 'feature', 'hero'],
      tracking: ['display', 'heading', 'eyebrow'],
      leading: ['display'],
      aspect: ['package'],
      font: ['package', 'package-display'],
      'drop-shadow': ['package'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Arredonda como o round(numeric, 2) do Postgres, sem o erro de ponto flutuante
export const roundMoney = (value: number) => Math.round(Number((value * 100).toFixed(6))) / 100
