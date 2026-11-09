'use client'

import { createContext, useContext, useMemo } from 'react'
import { findProduct } from '@/data/products'
import { findBox, kitTotals } from '@/data/kits'
import type { Catalog } from '@/types/catalog'
import type { KitSpec } from '@/types/kit'

type CatalogValue = Catalog & {
  findProduct: (slug: string) => ReturnType<typeof findProduct>
  findBox: (id: string) => ReturnType<typeof findBox>
  kitTotals: (spec: Pick<KitSpec, 'box' | 'slugs'>) => ReturnType<typeof kitTotals>
}

const CatalogContext = createContext<CatalogValue | null>(null)

// Catálogo carregado no servidor (layout) e compartilhado com os componentes do navegador
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const value = useMemo<CatalogValue>(() => ({
    ...catalog,
    findProduct: (slug) => findProduct(catalog.products, slug),
    findBox: (id) => findBox(catalog.boxes, id),
    kitTotals: (spec) => kitTotals(spec, catalog),
  }), [catalog])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog precisa do CatalogProvider')
  return context
}
