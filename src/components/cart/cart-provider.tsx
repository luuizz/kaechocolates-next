'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { findProduct, type Product } from '@/data/products'

type Line = { slug: string; quantity: number }
export type CartItem = Line & { product: Product }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (slug: string, quantity?: number) => void
  update: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'kae:sacola'
export const MAX_PER_ITEM = 20

// Sacola salva no navegador. Na fase do Neon, passa a ser sincronizada com a conta.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Line[]
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do navegador
      setLines(saved.filter((line) => findProduct(line.slug)))
    } catch {
      /* sem armazenamento: sacola começa vazia */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)) } catch { /* ignora */ }
  }, [lines, loaded])

  const add = useCallback((slug: string, quantity = 1) => {
    const product = findProduct(slug)
    if (!product || product.soldOut) return
    setLines((current) => {
      const existing = current.find((line) => line.slug === slug)
      if (existing) return current.map((line) => (line.slug === slug ? { ...line, quantity: Math.min(MAX_PER_ITEM, line.quantity + quantity) } : line))
      return [...current, { slug, quantity: Math.min(MAX_PER_ITEM, quantity) }]
    })
    setOpen(true)
  }, [])

  const update = useCallback((slug: string, quantity: number) => {
    setLines((current) => (quantity <= 0 ? current.filter((line) => line.slug !== slug) : current.map((line) => (line.slug === slug ? { ...line, quantity: Math.min(MAX_PER_ITEM, quantity) } : line))))
  }, [])
  const remove = useCallback((slug: string) => setLines((current) => current.filter((line) => line.slug !== slug)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const items = lines.map((line) => ({ ...line, product: findProduct(line.slug)! })).filter((item) => item.product)
    return {
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.quantity * item.product.price, 0),
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
    }
  }, [lines, open, add, update, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro do CartProvider')
  return context
}
