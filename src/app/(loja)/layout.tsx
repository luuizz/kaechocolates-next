import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/auth/auth-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CartProvider } from '@/components/cart/cart-provider'
import { CatalogProvider } from '@/components/catalog/catalog-provider'
import { RootDocument } from '@/components/layout/root-document'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { brand } from '@/config/brand'
import { getCatalog } from '@/lib/server/catalog'

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `${brand.name} · ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  robots: brand.indexable ? undefined : { index: false, follow: false },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: brand.name },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = { themeColor: '#ffffff' }

// Layout raiz da loja: catálogo, sacola, cabeçalho e rodapé
export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog()
  return (
    <RootDocument area="loja">
      <CatalogProvider catalog={catalog}>
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1 overflow-x-clip">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </RootDocument>
  )
}
