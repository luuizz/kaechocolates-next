import type { Metadata } from 'next'
import { brand } from '@/config/brand'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `${brand.name} · ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  robots: brand.indexable ? undefined : { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
