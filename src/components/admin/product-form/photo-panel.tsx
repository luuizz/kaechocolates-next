'use client'

import { useRef, useState } from 'react'
import { CircleNotch, Image as ImageIcon, Trash, UploadSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Panel } from '../admin-shell'
import { ColorField } from './color-field'
import type { Draft, SetField } from './draft'
import { IMAGE_TYPES } from '@/constants/limits'

type PhotoPanelProps = {
  draft: Draft
  set: SetField
  uploading: boolean
  onFile: (file?: File | null) => void
}

export function PhotoPanel({ draft, set, uploading, onFile }: PhotoPanelProps) {
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <Panel>
      <h2 className="font-display text-lg font-bold">Foto e cores</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sem foto, a loja desenha a embalagem com as cores abaixo. Para a foto, use PNG com fundo transparente, na
        vertical (proporção 311 × 405).
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_1fr]">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            onFile(event.dataTransfer.files[0])
          }}
          className={cn(
            'relative grid aspect-package place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
            dragging && 'border-foreground bg-secondary',
          )}
          style={draft.image ? { background: draft.tile } : undefined}
        >
          {draft.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia de upload recém-enviado, fora do otimizador
            <img src={draft.image} alt="Foto atual" className="size-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-2 p-4 text-center text-xs text-muted-foreground">
              <ImageIcon size={28} /> Arraste a foto aqui
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <CircleNotch size={28} className="animate-spin" />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={Object.keys(IMAGE_TYPES).join(',')}
              className="sr-only"
              onChange={(event) => {
                onFile(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}>
              <UploadSimple /> {draft.image ? 'Trocar foto' : 'Enviar foto'}
            </Button>
            {draft.image && (
              <Button type="button" variant="ghost" onClick={() => set('image', '')}>
                <Trash /> Usar embalagem desenhada
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Cor da etiqueta" value={draft.label} onChange={(value) => set('label', value)} />
            <ColorField label="Fundo na vitrine" value={draft.tile} onChange={(value) => set('tile', value)} />
          </div>
          <fieldset>
            <legend className="text-sm font-semibold">Texto da etiqueta</legend>
            <div className="mt-2 flex gap-2">
              {(['dark', 'light'] as const).map((tone) => (
                <label
                  key={tone}
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold has-[:checked]:border-foreground has-[:checked]:bg-secondary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-foreground/10"
                >
                  <input
                    type="radio"
                    name="labelText"
                    value={tone}
                    checked={draft.labelText === tone}
                    onChange={() => set('labelText', tone)}
                    className="sr-only"
                  />
                  <span className={cn('size-4 rounded-full border', tone === 'dark' ? 'bg-ink' : 'bg-white')} />{' '}
                  {tone === 'dark' ? 'Escuro' : 'Claro'}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </Panel>
  )
}
