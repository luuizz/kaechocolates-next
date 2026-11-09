'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass, PencilSimple, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { BarPackage } from '@/components/product/bar-package'
import { LINES, formatBRL } from '@/data/products'
import { listProducts, refreshStore, updateProductFields } from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'
import { Switch } from './switch'
import type { AdminProduct, Line } from '@/types/product'

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function ProductList() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null)
  const [search, setSearch] = useState('')
  const [line, setLine] = useState<Line | 'todas'>('todas')

  const load = useCallback(() => listProducts().then(setProducts).catch((err) => toast.error(err.message)), [])
  useEffect(() => { load() }, [load])

  const list = useMemo(() => {
    const term = normalize(search.trim())
    return (products ?? []).filter((product) => (line === 'todas' || product.line === line) && (!term || normalize(`${product.name} ${product.slug} ${product.cacao}`).includes(term)))
  }, [products, search, line])

  const toggle = async (product: AdminProduct, field: 'active' | 'sold_out', value: boolean) => {
    const patch = field === 'active' ? { active: value } : { soldOutFlag: value, soldOut: value || product.stock === 0 }
    setProducts((current) => current?.map((item) => (item.id === product.id ? { ...item, ...patch } : item)) ?? null)
    try {
      await updateProductFields(product.id, { [field]: value })
      await refreshStore().catch(() => {})
      toast.success(field === 'active' ? (value ? `${product.name} voltou para a loja` : `${product.name} foi ocultado da loja`) : (value ? `${product.name} marcado como esgotado` : `${product.name} disponível de novo`))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.')
      load()
    }
  }

  return (
    <>
      <AdminHeader
        title="Produtos"
        description={products ? `${products.length} barras cadastradas` : 'Carregando…'}
        actions={<Button asChild><Link href="/admin/produtos/novo"><Plus weight="bold" /> Nova barra</Link></Button>}
      />
      <Panel className="p-0 md:p-0">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="relative md:w-80">
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou % de cacau" aria-label="Buscar produtos" className="h-11 pl-10" />
          </div>
          <div role="tablist" aria-label="Filtrar por linha" className="flex flex-wrap gap-2">
            {(['todas', ...Object.keys(LINES)] as const).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={line === value} onClick={() => setLine(value as Line | 'todas')} className={cn('h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors', line === value ? 'border-foreground bg-foreground text-background' : 'hover:border-foreground')}>
                {value === 'todas' ? 'Todas' : LINES[value as Line]}
              </button>
            ))}
          </div>
        </div>

        {!products ? (
          <ul className="divide-y">{Array.from({ length: 6 }, (_, index) => <li key={index} className="flex items-center gap-4 p-4"><span className="h-16 w-12 animate-pulse rounded-lg bg-secondary" /><span className="h-4 w-48 animate-pulse rounded bg-secondary" /></li>)}</ul>
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Nenhuma barra encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Barra</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Linha</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Preço</th>
                  <th scope="col" className="px-3 py-3 text-center font-semibold">Na loja</th>
                  <th scope="col" className="px-3 py-3 text-center font-semibold">Esgotada</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((product) => (
                  <tr key={product.id} className={cn('transition-colors hover:bg-secondary/60', !product.active && 'text-muted-foreground')}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/produtos/${product.id}`} className="flex items-center gap-4">
                        <span className={cn('w-12 shrink-0 overflow-hidden rounded-lg', !product.active && 'opacity-50 grayscale')} style={{ background: product.tile }}><BarPackage product={product} /></span>
                        <span>
                          <span className="block font-semibold text-foreground">{product.name} {product.cacao}%</span>
                          <span className="block text-xs text-muted-foreground">{product.slug}{product.badge ? ` · ${product.badge}` : ''}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">{LINES[product.line]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatBRL(product.price)}</td>
                    <td className="px-3 py-3 text-center"><Switch checked={product.active} onChange={(value) => toggle(product, 'active', value)} label={`${product.name} visível na loja`} /></td>
                    <td className="px-3 py-3 text-center"><Switch checked={product.soldOutFlag} onChange={(value) => toggle(product, 'sold_out', value)} label={`${product.name} esgotada`} tone="danger" />{product.stock !== undefined && <span className={cn('mt-1 block text-2xs', product.stock === 0 ? 'font-semibold text-destructive' : 'text-muted-foreground')}>{product.stock} em estoque</span>}</td>
                    <td className="px-5 py-3 text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/produtos/${product.id}`}><PencilSimple /> Editar</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
