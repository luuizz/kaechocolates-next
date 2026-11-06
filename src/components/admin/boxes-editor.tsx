'use client'

import { ArrowDown, ArrowUp, CircleNotch, Plus, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { slugify } from '@/lib/utils'
import { listBoxes, type AdminBox } from '@/lib/admin-api'
import { AdminHeader, Panel } from './admin-shell'
import { fromPercent, percent, useListEditor } from './list-editor'
import { Switch } from './switch'

export function BoxesEditor() {
  const list = useListEditor<AdminBox>('kit_boxes', listBoxes)

  const submit = () => list.save(
    (rows) => rows.find((row) => !row.name.trim() || !row.id || row.size < 1) ? 'Cada caixa precisa de nome, código e quantidade de barras.' : null,
    (row) => ({ name: row.name.trim(), size: row.size, discount: row.discount, note: row.note?.trim() || null, active: row.active }),
  )

  return (
    <>
      <AdminHeader
        title="Caixas de kit"
        description="Tamanhos e descontos do “Monte seu kit”. O kit dos premiados usa a caixa de código “m”."
        actions={<Button onClick={submit} disabled={list.saving || !list.dirty}>{list.saving && <CircleNotch className="animate-spin" />} Salvar</Button>}
      />
      <Panel className="p-0 md:p-0">
        {!list.rows ? (
          <div className="h-48 animate-pulse rounded-[1.5rem] bg-background" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Nome</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Código</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Barras</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Desconto (%)</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Chamada</th>
                  <th scope="col" className="px-2 py-3 text-center font-semibold">Ativa</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Ordem e remover</span></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.rows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-5 py-2.5"><Input value={row.name} onChange={(event) => list.update(index, { name: event.target.value })} aria-label="Nome da caixa" className="h-10 min-w-36" /></td>
                    <td className="px-2 py-2.5"><Input value={row.id} disabled={!list.isNew(row.id)} onChange={(event) => list.update(index, { id: slugify(event.target.value) })} aria-label="Código" className="h-10 w-20 font-mono" /></td>
                    <td className="px-2 py-2.5"><Input value={row.size || ''} onChange={(event) => list.update(index, { size: Math.min(24, Number(event.target.value.replace(/\D/g, '')) || 0) })} inputMode="numeric" aria-label="Quantidade de barras" className="h-10 w-20" /></td>
                    <td className="px-2 py-2.5"><Input key={`${row.id}-${index}-${row.discount}`} defaultValue={percent(row.discount)} onBlur={(event) => list.update(index, { discount: fromPercent(event.target.value) })} inputMode="decimal" aria-label="Desconto em %" className="h-10 w-24" /></td>
                    <td className="px-2 py-2.5"><Input value={row.note ?? ''} onChange={(event) => list.update(index, { note: event.target.value })} aria-label="Chamada" className="h-10 min-w-40" placeholder="A mais pedida" /></td>
                    <td className="px-2 py-2.5 text-center"><Switch checked={row.active} onChange={(active) => list.update(index, { active })} label={`${row.name} ativa`} /></td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => list.move(index, -1)} disabled={index === 0} aria-label="Subir"><ArrowUp /></Button>
                        <Button variant="ghost" size="icon" onClick={() => list.move(index, 1)} disabled={index === list.rows!.length - 1} aria-label="Descer"><ArrowDown /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => list.remove(index)} aria-label={`Remover ${row.name}`}><Trash /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t p-4">
          <Button variant="outline" onClick={() => list.add({ id: `caixa-${(list.rows?.length ?? 0) + 1}`, name: 'Nova caixa', size: 4, discount: 0.05, note: '', active: true, sort_order: 0 })}><Plus /> Adicionar caixa</Button>
        </div>
      </Panel>
    </>
  )
}
