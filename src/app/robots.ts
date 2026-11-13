import type { MetadataRoute } from 'next'
import { brand } from '@/config/brand'

export default function robots(): MetadataRoute.Robots {
  return brand.indexable
    ? {
        rules: {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/admin',
            '/conta',
            '/carrinho',
            '/checkout',
            '/api/',
            '/entrar',
            '/cadastro',
            '/recuperar-senha',
            '/redefinir-senha',
          ],
        },
        sitemap: `${brand.url}/sitemap.xml`,
        host: brand.url,
      }
    : { rules: { userAgent: '*', disallow: '/' } }
}
