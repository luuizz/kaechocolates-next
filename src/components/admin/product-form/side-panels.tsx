import { Field, Input } from '@/components/ui/field'
import { BarPackage } from '@/components/product/bar-package'
import { formatBRL } from '@/data/products'
import { cn } from '@/lib/utils'
import { Panel } from '../admin-shell'
import { Switch } from '../switch'
import type { Draft, DraftPreview, SetField } from './draft'

export function StorePanel({ draft, set }: { draft: Draft; set: SetField }) {
  return (
    <Panel>
      <h2 className="font-display text-lg font-bold">Na loja</h2>
      <div className="mt-4 flex flex-col gap-4">
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">Visível na loja <Switch checked={draft.active} onChange={(value) => set('active', value)} label="Visível na loja" /></label>
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">Esgotada <Switch checked={draft.soldOut} onChange={(value) => set('soldOut', value)} label="Esgotada" tone="danger" /></label>
        <Field label="Estoque" hint={draft.stock === '0' ? 'Zerado: a barra aparece como esgotada.' : 'Vazio = não controla. Cada venda desconta daqui.'}><Input value={draft.stock} onChange={(event) => set('stock', event.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" placeholder="Sem controle" /></Field>
        <Field label="Ordem na vitrine" hint="Menor aparece primeiro. Os 14 primeiros formam o mosaico da home."><Input value={draft.sortOrder} onChange={(event) => set('sortOrder', event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Último" /></Field>
      </div>
    </Panel>
  )
}

export function PreviewPanel({ preview }: { preview: DraftPreview }) {
  return (
    <Panel>
      <h2 className="font-display text-lg font-bold">Prévia</h2>
      <div className="relative mt-4 overflow-hidden rounded-2xl" style={{ background: preview.tile }}>
        {preview.badge && <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-2xs font-bold uppercase tracking-wider">{preview.badge}</span>}
        <BarPackage product={preview} className={cn(preview.soldOut && 'opacity-60')} />
      </div>
      <p className="mt-3 font-display font-bold">{preview.name} {preview.cacao}%</p>
      <p className="text-sm text-muted-foreground">{preview.short || 'Frase curta da barra'}</p>
      <p className="mt-1 text-sm">{preview.compareAt && <s className="mr-2 text-muted-foreground">{formatBRL(preview.compareAt)}</s>}<strong>{preview.soldOut ? 'Esgotado' : formatBRL(preview.price)}</strong></p>
    </Panel>
  )
}
