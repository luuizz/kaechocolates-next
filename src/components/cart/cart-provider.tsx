'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useCatalog } from '@/components/catalog/catalog-provider'
import type { KitSpec } from '@/types/kit'
import type { Product } from '@/types/product'
import { CART_STORAGE_KEY } from '@/constants/storage'
import { MAX_PER_ITEM } from '@/constants/limits'

type ProductLine = { kind: 'product'; id: string; slug: string; quantity: number }
type KitLine = { kind: 'kit'; id: string; quantity: number; kit: KitSpec }
type Line = ProductLine | KitLine

export type CartItem =
  | (ProductLine & { title: string; unitPrice: number; product: Product })
  | (KitLine & { title: string; unitPrice: number; products: Product[]; fullPrice: number })

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (slug: string, quantity?: number) => void
  addKit: (kit: KitSpec) => void
  update: (id: string, quantity: number) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const kitId = (kit: KitSpec) => `kit:${kit.box}:${[...kit.slugs].sort().join(',')}:${kit.message ?? ''}`

// Lê o que estava salvo, aceitando o formato antigo ({ slug, quantity })
// Itens que saíram do catálogo somem da sacola na hora de montar a lista (value).
function restore(raw: unknown): Line[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((line): Line[] => {
    if (line?.kind === 'kit' && line.kit && typeof line.kit.box === 'string' && Array.isArray(line.kit.slugs))
      return [line as KitLine]
    const slug = line?.slug
    if (typeof slug === 'string') return [{ kind: 'product', id: slug, slug, quantity: Number(line.quantity) || 1 }]
    return []
  })
}

// Sacola salva no navegador. Preços sempre do catálogo atual (nunca do que ficou salvo).
export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog()
  const { findProduct, findBox, kitTotals } = catalog
  const [lines, setLines] = useState<Line[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do navegador
      setLines(restore(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')))
    } catch {
      /* sem armazenamento: sacola começa vazia */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* ignora */
    }
  }, [lines, loaded])

  const push = useCallback((line: Line) => {
    setLines((current) => {
      const existing = current.find((item) => item.id === line.id)
      if (existing)
        return current.map((item) =>
          item.id === line.id ? { ...item, quantity: Math.min(MAX_PER_ITEM, item.quantity + line.quantity) } : item,
        )
      return [...current, line]
    })
    setOpen(true)
  }, [])

  const add = useCallback(
    (slug: string, quantity = 1) => {
      const product = findProduct(slug)
      if (!product || product.soldOut) return
      push({ kind: 'product', id: slug, slug, quantity: Math.min(MAX_PER_ITEM, quantity) })
    },
    [push, findProduct],
  )

  const addKit = useCallback((kit: KitSpec) => push({ kind: 'kit', id: kitId(kit), quantity: 1, kit }), [push])

  const update = useCallback((id: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity: Math.min(MAX_PER_ITEM, quantity) } : line)),
    )
  }, [])
  const remove = useCallback((id: string) => setLines((current) => current.filter((line) => line.id !== id)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const items = lines.flatMap((line): CartItem[] => {
      if (line.kind === 'product') {
        const product = findProduct(line.slug)
        return product && !product.soldOut
          ? [{ ...line, product, title: `${product.name} ${product.cacao}%`, unitPrice: product.price }]
          : []
      }
      if (!findBox(line.kit.box)) return []
      const totals = kitTotals(line.kit)
      if (!totals.products.length) return []
      return [
        {
          ...line,
          products: totals.products,
          title: line.kit.name,
          unitPrice: totals.total,
          fullPrice: totals.subtotal,
        },
      ]
    })
    return {
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: Math.round(items.reduce((total, item) => total + item.quantity * item.unitPrice, 0) * 100) / 100,
      open,
      setOpen,
      add,
      addKit,
      update,
      remove,
      clear,
    }
  }, [lines, open, add, addKit, update, remove, clear, findProduct, findBox, kitTotals])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro do CartProvider')
  return context
}

// Formato que o checkout manda para o servidor (sem preços: o banco recalcula)
export const toCheckoutItems = (items: CartItem[]) =>
  items.map((item) =>
    item.kind === 'product'
      ? { kind: 'product' as const, slug: item.slug, quantity: item.quantity }
      : {
          kind: 'kit' as const,
          name: item.kit.name,
          box: item.kit.box,
          slugs: item.kit.slugs,
          message: item.kit.message,
          quantity: item.quantity,
        },
  )
