import type { MetadataRoute } from 'next'
import { brand } from '@/config/brand'
import { LINES } from '@/data/products'
import { getCatalog } from '@/lib/server/catalog'

// Páginas públicas + uma entrada por barra do catálogo (atualiza junto com o painel)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog()
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly') => ({ url: `${brand.url}${path}`, priority, changeFrequency })

  return [
    page('', 1, 'weekly'),
    page('/produtos', 0.9, 'weekly'),
    ...Object.keys(LINES).map((line) => page(`/produtos?linha=${line}`, 0.7, 'weekly')),
    ...products.map((product) => page(`/produtos/${product.slug}`, product.soldOut ? 0.5 : 0.8, 'weekly')),
    page('/kits', 0.8),
    page('/clube', 0.8),
    page('/quem-somos', 0.6),
    page('/perguntas', 0.5),
    page('/contato', 0.5),
    page('/termos', 0.2, 'yearly'),
    page('/politica-privacidade', 0.2, 'yearly'),
  ]
}
