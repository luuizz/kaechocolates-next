'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { refreshStore, saveRows } from '@/lib/admin-api'

// Estado comum das telas que editam uma lista inteira (caixas, planos, períodos):
// carrega, guarda o que foi removido, valida e grava tudo de uma vez.
export function useListEditor<T extends { id: string; sort_order: number }>(
  table: 'kit_boxes' | 'club_plans' | 'club_periods',
  load: () => Promise<T[]>,
) {
  const [rows, setRows] = useState<T[] | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [snapshot, setSnapshot] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => load().then((data) => {
    setRows(data)
    setSavedIds(data.map((row) => row.id))
    setSnapshot(JSON.stringify(data))
  }).catch((err) => toast.error(err.message)), [load])

  useEffect(() => { reload() }, [reload])

  const update = (index: number, patch: Partial<T>) => setRows((current) => current?.map((row, position) => (position === index ? { ...row, ...patch } : row)) ?? null)
  const add = (row: T) => setRows((current) => [...(current ?? []), row])
  const remove = (index: number) => setRows((current) => current?.filter((_, position) => position !== index) ?? null)
  const move = (index: number, delta: -1 | 1) => setRows((current) => {
    if (!current) return current
    const target = index + delta
    if (target < 0 || target >= current.length) return current
    const next = [...current]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })

  const save = async (validate: (rows: T[]) => string | null, toRow: (row: T) => Record<string, unknown>) => {
    if (!rows) return
    const problem = validate(rows)
    if (problem) return toast.error(problem)
    const ids = rows.map((row) => row.id)
    if (new Set(ids).size !== ids.length) return toast.error('Dois itens estão com o mesmo código.')
    setSaving(true)
    try {
      const ordered = rows.map((row, index) => ({ ...toRow(row), id: row.id, sort_order: (index + 1) * 10 }))
      await saveRows(table, ordered as { id: string }[], savedIds.filter((id) => !ids.includes(id)))
      await refreshStore().catch(() => toast.warning('Salvo. A loja pode levar alguns minutos para mostrar a mudança.'))
      toast.success('Alterações salvas.')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
    setSaving(false)
  }

  const dirty = rows !== null && JSON.stringify(rows) !== snapshot
  return { rows, update, add, remove, move, save, saving, dirty, isNew: (id: string) => !savedIds.includes(id) }
}

export const percent = (value: number) => String(Math.round(value * 1000) / 10).replace('.', ',')
export const fromPercent = (value: string) => Math.min(50, Math.max(0, Number(value.replace(',', '.')) || 0)) / 100
