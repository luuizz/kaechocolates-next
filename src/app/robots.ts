import type { MetadataRoute } from 'next'
import { brand } from '@/config/brand'

// Enquanto for projeto conceito, nada de indexação
export default function robots(): MetadataRoute.Robots {
  return brand.indexable
    ? { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/conta', '/checkout'] }, sitemap: `${brand.url}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } }
}
