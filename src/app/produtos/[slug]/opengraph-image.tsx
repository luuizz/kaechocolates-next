import { ImageResponse } from 'next/og'
import { brand } from '@/config/brand'
import { findProduct, formatBRL } from '@/data/products'
import { getCatalog } from '@/lib/server/catalog'
import { OG_SIZE, OgPackage, ogAsset, ogFonts } from '@/lib/seo/og'
import { LINE_SINGULAR } from '@/constants/catalog'

export const alt = 'Barra de chocolate Kaê'
export const size = OG_SIZE
export const contentType = 'image/png'

export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((product) => ({ slug: product.slug }))
}

// Imagem de compartilhamento de cada barra: cor do sabor, nome, preço e a embalagem
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const product = findProduct((await getCatalog()).products, (await params).slug)
  const [fonts, logo, photo] = await Promise.all([
    ogFonts(),
    ogAsset(brand.logo.src),
    product?.image ? ogAsset(product.image) : null,
  ])

  if (!product) {
    return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff' }} />, {
      ...size,
      fonts,
    })
  }

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: product.tile, fontFamily: 'Jakarta' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 700,
          padding: '56px 0 56px 64px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: '#ffffff',
            borderRadius: 999,
            padding: '14px 28px',
          }}
        >
          {logo && <img src={logo} width={120} height={61} alt="" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: 'rgba(17,17,17,0.7)' }}
          >{`CHOCOLATE ${LINE_SINGULAR[product.line].toUpperCase()} · ${product.cacao}% CACAU`}</span>
          <span
            style={{
              marginTop: 12,
              fontSize: product.name.length > 16 ? 80 : 104,
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: -4,
              color: '#111111',
            }}
          >
            {product.name}
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.3,
              color: 'rgba(17,17,17,0.8)',
              maxWidth: 600,
            }}
          >
            {product.short}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              display: 'flex',
              background: '#111111',
              color: '#ffffff',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            {product.soldOut ? 'Esgotado' : formatBRL(product.price)}
          </span>
          {product.badge && (
            <span
              style={{
                display: 'flex',
                background: '#ffffff',
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {product.badge}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {photo ? (
          <img src={photo} width={430} height={560} alt="" style={{ objectFit: 'contain' }} />
        ) : (
          <OgPackage product={product} logo={logo} />
        )}
      </div>
    </div>,
    { ...size, fonts },
  )
}
