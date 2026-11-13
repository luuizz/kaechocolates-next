import { useId } from 'react'
import { LINE_SINGULAR } from '@/constants/catalog'
import type { Product } from '@/types/product'
import { PackageLogo } from './package-logo'
import { CraftSeal, FreeFromIcons, HighInSeal } from './package-seals'

type PackageArtProps = { product: Product; className?: string }

const nameSize = (name: string) => Math.min(31, 196 / (name.length * 0.56))

function weightLabel(weight: string) {
  const grams = Number.parseFloat(weight.replace(',', '.'))
  if (!Number.isFinite(grams) || !/g\s*$/i.test(weight)) return weight
  return `${weight} | ${(Math.floor((grams / 28.3495) * 10) / 10).toFixed(1)} oz`
}

export function PackageArt({ product, className }: PackageArtProps) {
  const sealId = `selo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const ink = product.labelText === 'light' ? '#fff' : '#1d1a14'
  const kind = product.line === 'intensos' ? '' : `${LINE_SINGULAR[product.line]} `
  const note = product.packageNote?.trim()
  return (
    <svg viewBox="0 0 300 570" className={className}>
      <rect width="300" height="570" rx="3" fill="#fff" />
      <path d="M46 0 H254 V9 Q254 11 252 11 H48 Q46 11 46 9 Z" fill={product.label} />
      <line x1="0" y1="11" x2="300" y2="11" stroke="#ececea" strokeWidth="0.6" />

      <HighInSeal sugar={product.highSugar ?? true} fat={product.highFat ?? true} />
      <g className="text-ink">
        <PackageLogo />
      </g>

      <g fill={ink} textAnchor="middle">
        <rect x="40" y="140" width="214" height="240" rx="8" fill={product.label} />
        <text
          x="147"
          y="198"
          className="font-package-display"
          fontSize={nameSize(product.name)}
          fontWeight={700}
          letterSpacing="-0.6"
        >
          {product.name}
        </text>
        <text
          x="147"
          y="318"
          className="font-package-display"
          fontSize={product.cacao >= 100 ? 96 : 132}
          fontWeight={700}
          letterSpacing="-4"
        >
          {product.cacao}
        </text>
        <text x="147" y={note ? 349 : 355} className="font-package" fontSize="9" fontWeight={500} letterSpacing="0.3">
          {`CHOCOLATE ${kind}${product.cacao}%`.toUpperCase()}
        </text>
        {note && (
          <text x="147" y="361" className="font-package" fontSize="9" fontWeight={500} letterSpacing="0.3">
            {note.toUpperCase()}
          </text>
        )}
      </g>

      <CraftSeal id={sealId} />
      <text
        x="149"
        y="414"
        className="font-package"
        fontSize="8"
        fontWeight={600}
        letterSpacing="0.5"
        textAnchor="middle"
        fill="#111"
      >
        CACAU DA BAHIA
      </text>
      <FreeFromIcons />
      <text x="149" y="534" className="font-package" fontSize="13" fontWeight={700} textAnchor="middle" fill="#111">
        {weightLabel(product.weight)}
      </text>
    </svg>
  )
}
