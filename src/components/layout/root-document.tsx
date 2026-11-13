import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import '@/app/globals.css'
import { recoleta, wotfard } from '@/components/product/package/fonts'
import { cn } from '@/lib/utils'

type RootDocumentProps = { area: 'loja' | 'painel'; className?: string; children: React.ReactNode }

export function RootDocument({ area, className, children }: RootDocumentProps) {
  return (
    // Extensões do navegador alteram <html>/<body> antes do React carregar
    <html lang="pt-BR" data-area={area} className={cn(recoleta.variable, wotfard.variable)} suppressHydrationWarning>
      <body className={cn('flex min-h-dvh flex-col font-sans', className)} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
