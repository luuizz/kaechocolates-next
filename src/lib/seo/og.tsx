import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Product } from '@/types/product'

// Peças comuns das imagens de compartilhamento (Open Graph), geradas com next/og
export const OG_SIZE = { width: 1200, height: 630 }

const root = process.cwd()

export async function ogFonts() {
  const [bold, semibold] = await Promise.all([
    readFile(join(root, 'src/assets/fonts/plus-jakarta-sans-latin-800-normal.woff')),
    readFile(join(root, 'src/assets/fonts/plus-jakarta-sans-latin-600-normal.woff')),
  ])
  return [
    { name: 'Jakarta', data: bold, weight: 800 as const, style: 'normal' as const },
    { name: 'Jakarta', data: semibold, weight: 600 as const, style: 'normal' as const },
  ]
}

// Arquivo de /public (lido do disco) ou imagem externa (Blob), como data URL
export async function ogAsset(src: string) {
  try {
    if (src.startsWith('http')) {
      const response = await fetch(src)
      if (!response.ok) return null
      const type = response.headers.get('content-type') ?? 'image/png'
      return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
    }
    const file = await readFile(join(root, 'public', src))
    const type = src.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
    return `data:${type};base64,${file.toString('base64')}`
  } catch {
    return null
  }
}

// Embalagem desenhada (mesma ideia do BarPackage), para barras sem foto
export function OgPackage({ product, logo, width = 330 }: { product: Product; logo: string | null; width?: number }) {
  const unit = width / 100
  const light = product.labelText === 'light'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width,
        height: width * 1.36,
        background: '#f4f3f1',
        borderRadius: 3 * unit,
        padding: `${5 * unit}px ${6 * unit}px`,
        boxShadow: '-12px 20px 40px rgba(17,17,17,0.3)',
        transform: 'rotate(-4deg)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logo && <img src={logo} width={46 * unit} height={23 * unit} alt="" />}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginTop: 7 * unit,
          padding: `${5 * unit}px ${3 * unit}px`,
          borderRadius: 2 * unit,
          background: product.label,
          color: light ? '#fff' : '#1d1d1b',
        }}
      >
        <span style={{ fontSize: 7 * unit, fontWeight: 800, textAlign: 'center', lineHeight: 1.05 }}>
          {product.name}
        </span>
        <span style={{ fontSize: 30 * unit, fontWeight: 800, lineHeight: 1, letterSpacing: -1.5 * unit }}>
          {product.cacao}
        </span>
        <span
          style={{ fontSize: 2.6 * unit, fontWeight: 600, letterSpacing: 0.3 * unit }}
        >{`${product.cacao}% DE CACAU`}</span>
      </div>
      <span
        style={{ marginTop: 'auto', fontSize: 3 * unit, fontWeight: 600, color: '#1d1d1b' }}
      >{`${product.weight} | 2.4 oz`}</span>
    </div>
  )
}
