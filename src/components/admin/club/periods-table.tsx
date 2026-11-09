'use client'

import { Input } from '@/components/ui/field'
import { slugify } from '@/lib/utils'
import { fromPercent, percent } from '../list-editor'
import { RowActions } from '../row-actions'
import { Switch } from '../switch'
import type { AdminPeriod } from '@/types/club'

type PeriodsTableProps = {
  rows: AdminPeriod[]
  isNew: (id: string) => boolean
  onChange: (index: number, patch: Partial<AdminPeriod>) => void
  onMove: (index: number, delta: -1 | 1) => void
  onRemove: (index: number) => void
}

const COLUMNS = ['Nome', 'Código', 'Meses', 'Desconto (%)', 'Selo']

export function PeriodsTable({ rows, isNew, onChange, onMove, onRemove }: PeriodsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] text-sm">
        <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
          <tr>
            {COLUMNS.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={index === 0 ? 'px-5 py-3 font-semibold' : 'px-2 py-3 font-semibold'}
              >
                {column}
              </th>
            ))}
            <th scope="col" className="px-2 py-3 text-center font-semibold">
              Ativo
            </th>
            <th scope="col" className="px-5 py-3">
              <span className="sr-only">Ordem e remover</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-5 py-2.5">
                <Input
                  value={row.label}
                  onChange={(event) => onChange(index, { label: event.target.value })}
                  aria-label="Nome do período"
                  className="h-10 min-w-32"
                />
              </td>
              <td className="px-2 py-2.5">
                <Input
                  value={row.id}
                  disabled={!isNew(row.id)}
                  onChange={(event) => onChange(index, { id: slugify(event.target.value) })}
                  aria-label="Código"
                  className="h-10 w-32 font-mono"
                />
              </td>
              <td className="px-2 py-2.5">
                <Input
                  value={row.months || ''}
                  onChange={(event) =>
                    onChange(index, { months: Math.min(12, Number(event.target.value.replace(/\D/g, '')) || 0) })
                  }
                  inputMode="numeric"
                  aria-label="Meses"
                  className="h-10 w-20"
                />
              </td>
              <td className="px-2 py-2.5">
                <Input
                  key={`${row.id}-${index}-${row.discount}`}
                  defaultValue={percent(row.discount)}
                  onBlur={(event) => onChange(index, { discount: fromPercent(event.target.value) })}
                  inputMode="decimal"
                  aria-label="Desconto em %"
                  className="h-10 w-24"
                />
              </td>
              <td className="px-2 py-2.5">
                <Input
                  value={row.note ?? ''}
                  onChange={(event) => onChange(index, { note: event.target.value })}
                  aria-label="Selo"
                  className="h-10 min-w-36"
                  placeholder="10% off"
                />
              </td>
              <td className="px-2 py-2.5 text-center">
                <Switch
                  checked={row.active}
                  onChange={(active) => onChange(index, { active })}
                  label={`${row.label} ativo`}
                />
              </td>
              <td className="px-5 py-2.5">
                <RowActions
                  className="justify-end gap-1"
                  isFirst={index === 0}
                  isLast={index === rows.length - 1}
                  onMove={(delta) => onMove(index, delta)}
                  onRemove={() => onRemove(index)}
                  removeLabel={`Remover ${row.label}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
