import { brand } from '@/config/brand'
import { LINES } from '@/data/products'
import type { Product } from '@/types/product'

// Dados estruturados (schema.org) para o Google entender loja, produtos e perguntas

export const absolute = (path: string) => (path.startsWith('http') ? path : `${brand.url}${path}`)

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // "<" escapado para o JSON nunca fechar a tag <script> antes da hora
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const organizationId = `${brand.url}/#organizacao`

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': organizationId,
  name: brand.name,
  url: brand.url,
  logo: absolute(brand.logo.src),
  description: brand.description,
  email: brand.contact.email,
  telephone: `+${brand.contact.whatsapp}`,
  sameAs: [brand.social.instagram],
  address: {
    '@type': 'PostalAddress',
    streetAddress: brand.contact.address.split(' · ')[0],
    addressLocality: 'Varginha',
    addressRegion: 'MG',
    postalCode: brand.contact.address.match(/\d{5}-\d{3}/)?.[0],
    addressCountry: 'BR',
  },
})

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: brand.name,
  url: brand.url,
  inLanguage: 'pt-BR',
  publisher: { '@id': organizationId },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${brand.url}/produtos?busca={busca}` },
    'query-input': 'required name=busca',
  },
})

export const productLd = (product: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${product.name} ${product.cacao}%`,
  description: product.description || product.short,
  sku: product.slug,
  category: `Chocolate > ${LINES[product.line]}`,
  image: [absolute(product.image ?? `/produtos/${product.slug}/opengraph-image`)],
  brand: { '@type': 'Brand', name: brand.name },
  url: absolute(`/produtos/${product.slug}`),
  offers: {
    '@type': 'Offer',
    url: absolute(`/produtos/${product.slug}`),
    price: product.price.toFixed(2),
    priceCurrency: brand.commerce.currency,
    availability: product.soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': organizationId },
  },
})

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absolute(item.path),
  })),
})

export const faqPage = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})
