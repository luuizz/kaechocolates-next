import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // As imagens de compartilhamento leem fontes, logo e fotos do disco
  outputFileTracingIncludes: {
    '/opengraph-image': ['./src/assets/fonts/**', './public/brand/logo.svg', './public/images/produtos/**'],
    '/produtos/[slug]/opengraph-image': [
      './src/assets/fonts/**',
      './public/brand/logo.svg',
      './public/images/produtos/**',
    ],
  },
  images: {
    // Imagens enviadas pelo painel (Vercel Blob)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default nextConfig
