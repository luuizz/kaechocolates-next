import { ImageResponse } from 'next/og'
import { brand } from '@/config/brand'
import { FALLBACK_PRODUCTS } from '@/data/products'
import { OG_SIZE, ogAsset, ogFonts } from '@/lib/seo/og'

export const alt = `${brand.name} · ${brand.tagline}`
export const size = OG_SIZE
export const contentType = 'image/png'

// Imagem padrão ao compartilhar o site: frase da marca e quatro barras com foto
export default async function Image() {
  const withPhoto = FALLBACK_PRODUCTS.filter((product) => product.image).slice(0, 4)
  const [fonts, logo, ...photos] = await Promise.all([ogFonts(), ogAsset(brand.logo.src), ...withPhoto.map((product) => ogAsset(product.image!))])

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#ffffff', fontFamily: 'Jakarta' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 560, padding: '64px 0 64px 72px' }}>
          {logo && <img src={logo} width={186} height={94} alt="" />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3, color: '#111111' }}>{brand.tagline}</span>
            <span style={{ marginTop: 24, fontSize: 26, fontWeight: 600, lineHeight: 1.35, color: '#5a5a58' }}>Chocolate bean to bar com cacau da Bahia e sabores do Brasil.</span>
          </div>
          <span style={{ display: 'flex', fontSize: 22, fontWeight: 600, color: '#111111' }}>{brand.url.replace(/^https?:\/\//, '')}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 640, padding: 24, gap: 16 }}>
          {withPhoto.map((product, index) => (
            <div key={product.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 288, height: 283, borderRadius: 28, background: product.tile }}>
              {photos[index] && <img src={photos[index]!} width={200} height={260} alt="" style={{ objectFit: 'contain' }} />}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
