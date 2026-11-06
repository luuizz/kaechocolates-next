import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Imagens enviadas pelo painel (Vercel Blob)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default nextConfig
