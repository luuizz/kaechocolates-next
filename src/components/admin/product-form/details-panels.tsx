import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { Panel } from '../admin-page'
import type { Draft, DraftErrors, SetField } from './draft'
import { BADGES, LINES } from '@/constants/catalog'

type PanelProps = {
  draft: Draft
  set: SetField
  error: (key: keyof DraftErrors) => string | null
}

type InfoPanelProps = PanelProps & { onSlugChange: (value: string) => void }

type TextEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

export function InfoPanel({ draft, set, error, onSlugChange }: InfoPanelProps) {
  const text =
    (key: 'name' | 'line' | 'badge' | 'short' | 'description' | 'ingredients' | 'packageNote') => (event: TextEvent) =>
      set(key, event.target.value as Draft[typeof key])
  return (
    <Panel>
      <h2 className="font-display text-lg font-bold">Informações</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem_10rem]">
        <Field label="Nome" error={error('name')}>
          <Input value={draft.name} onChange={text('name')} placeholder="Ex.: Cupuaçu" />
        </Field>
        <Field label="% de cacau" error={error('cacao')}>
          <Input
            value={draft.cacao}
            onChange={(event) => set('cacao', event.target.value.replace(/\D/g, '').slice(0, 3))}
            inputMode="numeric"
          />
        </Field>
        <Field label="Linha">
          <Select value={draft.line} onChange={text('line')}>
            {Object.entries(LINES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Endereço da página" error={error('slug')} hint={`/produtos/${draft.slug || '…'}`}>
          <Input value={draft.slug} onChange={(event) => onSlugChange(event.target.value)} />
        </Field>
        <Field label="Selo">
          <Select value={draft.badge} onChange={text('badge')}>
            <option value="">Sem selo</option>
            {BADGES.map((badge) => (
              <option key={badge}>{badge}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        className="mt-4"
        label="Frase curta"
        hint="Aparece no card da vitrine e no topo da página."
        error={error('short')}
      >
        <Input value={draft.short} onChange={text('short')} maxLength={140} />
      </Field>
      <Field
        className="mt-4"
        label="Descrição da embalagem"
        hint='Segunda linha do painel, abaixo de "Chocolate 64%". Ex.: "com café". Vazio = só a primeira linha.'
      >
        <Input value={draft.packageNote} onChange={text('packageNote')} maxLength={40} />
      </Field>
      <Field
        className="mt-4"
        label="Sobre o chocolate"
        hint="Texto completo da página. Se ficar vazio, usamos a frase curta."
      >
        <Textarea value={draft.description} onChange={text('description')} rows={4} />
      </Field>
      <Field className="mt-4" label="Ingredientes e alérgicos">
        <Textarea
          value={draft.ingredients}
          onChange={text('ingredients')}
          rows={3}
          placeholder="Massa de cacau, açúcar, … ALÉRGICOS: CONTÉM LEITE."
        />
      </Field>
    </Panel>
  )
}

const moneyText = (value: string) => value.replace(/[^\d,]/g, '')

export function PricePanel({ draft, set, error }: PanelProps) {
  return (
    <Panel>
      <h2 className="font-display text-lg font-bold">Preço</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Preço (R$)" error={error('price')}>
          <Input
            value={draft.price}
            onChange={(event) => set('price', moneyText(event.target.value))}
            inputMode="decimal"
            placeholder="32,70"
          />
        </Field>
        <Field label="Preço “de” (R$)" hint="Opcional, aparece riscado." error={error('compareAt')}>
          <Input
            value={draft.compareAt}
            onChange={(event) => set('compareAt', moneyText(event.target.value))}
            inputMode="decimal"
            placeholder="35,00"
          />
        </Field>
        <Field label="Peso">
          <Input value={draft.weight} onChange={(event) => set('weight', event.target.value)} placeholder="70 g" />
        </Field>
      </div>
    </Panel>
  )
}
