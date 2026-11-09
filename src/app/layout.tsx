import type { Metadata, Viewport } from 'next'
import { brand } from '@/config/brand'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { CartProvider } from '@/components/cart/cart-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CatalogProvider } from '@/components/catalog/catalog-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ShopChrome } from '@/components/layout/shop-chrome'
import { getCatalog } from '@/lib/server/catalog'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import './globals.css'

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog()
  return (
    // suppressHydrationWarning: extensões do navegador (gerenciadores de senha, tradutores…)
    // colocam atributos no <html>/<body> antes do React carregar. Vale só para estas duas tags.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans" suppressHydrationWarning>
        <CatalogProvider catalog={catalog}>
          <AuthProvider>
            <CartProvider>
              <ShopChrome header={<SiteHeader />} footer={<SiteFooter />} drawer={<CartDrawer />}>
                {children}
              </ShopChrome>
            </CartProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  )
}
