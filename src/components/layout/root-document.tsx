import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import '@/app/globals.css'
import { cn } from '@/lib/utils'

type RootDocumentProps = { area: 'loja' | 'painel'; className?: string; children: React.ReactNode }

// <html> e <body> comuns aos layouts raiz da loja e do painel (fontes e estilos globais)
export function RootDocument({ area, className, children }: RootDocumentProps) {
  return (
    // suppressHydrationWarning: extensões do navegador (gerenciadores de senha, tradutores…)
    // colocam atributos no <html>/<body> antes do React carregar. Vale só para estas duas tags.
    <html lang="pt-BR" data-area={area} suppressHydrationWarning>
      <body className={cn('flex min-h-dvh flex-col font-sans', className)} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
