'use client'

import { usePathname } from 'next/navigation'

// Cabeçalho, rodapé e sacola da loja. O painel (/admin) tem o próprio layout.
export function ShopChrome({ header, footer, drawer, children }: { header: React.ReactNode; footer: React.ReactNode; drawer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return <>{children}</>
  return (
    <>
      {header}
      <main className="flex-1 overflow-x-clip">{children}</main>
      {footer}
      {drawer}
    </>
  )
}
