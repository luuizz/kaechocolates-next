import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Loja e painel têm layouts raiz próprios; o 404 de URL inexistente fica em app/global-not-found.tsx
  experimental: { globalNotFound: true },
  // As imagens de compartilhamento leem fontes, logo e fotos do disco
  outputFileTracingIncludes: {
    // Dentro do grupo (loja) a rota ganha sufixo (/opengraph-image-xxxx)
    '/opengraph-image*': ['./src/assets/fonts/**', './public/brand/logo.svg', './public/images/produtos/**'],
    '/produtos/*/opengraph-image*': ['./src/assets/fonts/**', './public/brand/logo.svg', './public/images/produtos/**'],
  },
  images: {
    // Imagens enviadas pelo painel (Vercel Blob)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default nextConfig
