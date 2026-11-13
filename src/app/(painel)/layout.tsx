import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/auth/auth-provider'
import { RootDocument } from '@/components/layout/root-document'
import { brand } from '@/config/brand'
import './painel.css'

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: `Painel · ${brand.name}`, template: `%s · Painel` },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#111111' }

export default function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootDocument area="painel" className="bg-panel-canvas">
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="bottom-right" richColors closeButton />
    </RootDocument>
  )
}
