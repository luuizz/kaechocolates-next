import type { Metadata } from 'next'
import { brand } from '@/config/brand'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { CartProvider } from '@/components/cart/cart-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CatalogProvider } from '@/components/catalog/catalog-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ShopChrome } from '@/components/layout/shop-chrome'
import { getCatalog } from '@/lib/catalog'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `${brand.name} · ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  robots: brand.indexable ? undefined : { index: false, follow: false },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog()
  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh flex-col font-sans">
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
