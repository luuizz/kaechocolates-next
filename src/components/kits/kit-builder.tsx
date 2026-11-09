'use client'

import { BarPicker } from './builder/bar-picker'
import { BoxPicker } from './builder/box-picker'
import { KitSummary } from './builder/kit-summary'
import { useKitBuilder } from './builder/use-kit-builder'

// Montador de kit: escolhe a caixa, as barras e o recado do cartão
export function KitBuilder() {
  const kit = useKitBuilder()
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        <BoxPicker boxes={kit.boxes} boxId={kit.boxId} onChange={kit.changeBox} />
        <BarPicker available={kit.available} countOf={kit.countOf} full={kit.full} plus={kit.plus} minus={kit.minus} />
      </div>
      <KitSummary {...kit} />
    </div>
  )
}
