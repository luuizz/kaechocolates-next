'use client'

import { ArrowDown, ArrowUp, CircleNotch, Plus, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { brand } from '@/config/brand'
import { formatBRL } from '@/data/products'
import { listZones } from '@/lib/admin-api'
import { cn, slugify } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-page'
import { useListEditor } from './list-editor'
import { Switch } from './switch'
import type { AdminZone } from '@/types/shipping'
import { STATES } from '@/constants/address'

const money = (value: string) => Number(value.replace(/\./g, '').replace(',', '.')) || 0

// Frete por região: preço e prazo por grupo de estados
export function ShippingEditor() {
  const list = useListEditor<AdminZone>('shipping_zones', listZones)
  const used = new Map<string, string>()
  list.rows?.forEach((zone) => zone.active && zone.states.forEach((uf) => used.set(uf, zone.name)))
  const missing = STATES.filter((uf) => !used.has(uf))

  const submit = () =>
    list.save(
      (rows) =>
        rows.find(
          (row) => !row.name.trim() || !row.id || !row.states.length || row.days_min < 1 || row.days_max < row.days_min,
        )
          ? 'Cada região precisa de nome, código, ao menos um estado e prazo válido.'
          : null,
      (row) => ({
        name: row.name.trim(),
        states: row.states,
        price: row.price,
        days_min: row.days_min,
        days_max: row.days_max,
        active: row.active,
      }),
    )

  const toggleState = (index: number, uf: string) => {
    const zone = list.rows?.[index]
    if (!zone) return
    list.update(index, {
      states: zone.states.includes(uf) ? zone.states.filter((item) => item !== uf) : [...zone.states, uf],
    })
  }

  return (
    <>
      <AdminHeader
        title="Frete"
        description={`Preço e prazo por região. Acima de ${formatBRL(brand.commerce.freeShippingFrom)} em produtos o frete é grátis.`}
        actions={
          <Button onClick={submit} disabled={list.saving || !list.dirty}>
            {list.saving && <CircleNotch className="animate-spin" />} Salvar
          </Button>
        }
      />
      {list.rows && missing.length > 0 && (
        <p role="status" className="mb-6 rounded-xl bg-flavor-yellow/30 px-4 py-3 text-sm">
          Sem entrega para: <strong>{missing.join(', ')}</strong>. Clientes desses estados não conseguem finalizar a
          compra.
        </p>
      )}
      {!list.rows ? (
        <div className="h-72 animate-pulse rounded-tile bg-panel-surface" />
      ) : (
        <div className="flex flex-col gap-4">
          {list.rows.map((zone, index) => (
            <Panel key={index} className={cn(!zone.active && 'opacity-70')}>
              <div className="grid gap-4 md:grid-cols-[1fr_8rem_8rem_7rem_7rem]">
                <Field label="Região">
                  <Input
                    value={zone.name}
                    onChange={(event) =>
                      list.update(index, {
                        name: event.target.value,
                        ...(list.isNew(zone.id) && { id: slugify(event.target.value) || zone.id }),
                      })
                    }
                  />
                </Field>
                <Field label="Preço (R$)">
                  <Input
                    key={`${zone.id}-${index}-${zone.price}`}
                    defaultValue={zone.price.toFixed(2).replace('.', ',')}
                    onBlur={(event) => list.update(index, { price: money(event.target.value) })}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Código">
                  <Input value={zone.id} disabled className="font-mono text-xs md:text-xs" />
                </Field>
                <Field label="Prazo mín.">
                  <Input
                    value={zone.days_min || ''}
                    onChange={(event) =>
                      list.update(index, { days_min: Number(event.target.value.replace(/\D/g, '')) || 0 })
                    }
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Prazo máx.">
                  <Input
                    value={zone.days_max || ''}
                    onChange={(event) =>
                      list.update(index, { days_max: Number(event.target.value.replace(/\D/g, '')) || 0 })
                    }
                    inputMode="numeric"
                  />
                </Field>
              </div>
              <fieldset className="mt-4">
                <legend className="text-sm font-semibold">Estados</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {STATES.map((uf) => {
                    const on = zone.states.includes(uf)
                    const elsewhere = !on && used.get(uf)
                    return (
                      <button
                        key={uf}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleState(index, uf)}
                        title={elsewhere ? `Já está em ${elsewhere}` : undefined}
                        className={cn(
                          'h-8 w-11 rounded-lg border text-xs font-bold transition-colors',
                          on
                            ? 'border-foreground bg-foreground text-background'
                            : elsewhere
                              ? 'text-muted-foreground/50'
                              : 'hover:border-foreground',
                        )}
                      >
                        {uf}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Switch
                    checked={zone.active}
                    onChange={(active) => list.update(index, { active })}
                    label={`${zone.name} ativa`}
                  />{' '}
                  Ativa
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => list.move(index, -1)}
                    disabled={index === 0}
                    aria-label="Subir"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => list.move(index, 1)}
                    disabled={index === list.rows!.length - 1}
                    aria-label="Descer"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => list.remove(index)}
                    aria-label={`Remover ${zone.name}`}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
          <Button
            variant="outline"
            className="self-start"
            onClick={() =>
              list.add({
                id: `regiao-${(list.rows?.length ?? 0) + 1}`,
                name: 'Nova região',
                states: [],
                price: 29.9,
                days_min: 5,
                days_max: 10,
                active: true,
                sort_order: 0,
              })
            }
          >
            <Plus /> Adicionar região
          </Button>
        </div>
      )}
    </>
  )
}
