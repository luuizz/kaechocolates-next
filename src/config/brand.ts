// Tudo o que identifica a marca fica aqui (e nas cores de src/app/globals.css).
// Para publicar como projeto genérico, basta trocar este arquivo, o logo em
// /public/brand e as fotos de produto.
export const brand = {
  name: 'Kaê Chocolates',
  shortName: 'Kaê',
  tagline: 'Um Brasil em cada barra',
  description:
    'Chocolate bean to bar brasileiro: do grão à barra, com cacau da Bahia, ingredientes amazônicos e jeitinho mineiro.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  logo: { src: '/brand/logo.svg', alt: 'Kaê Chocolates' },
  social: {
    instagram: 'https://www.instagram.com/kaechocolates/',
  },
  contact: {
    city: 'Varginha, MG',
    whatsapp: '',
    email: '',
  },
  commerce: {
    currency: 'BRL',
    freeShippingFrom: 300,
    maxInstallments: 7,
  },
  // Enquanto o projeto for conceito: sem indexação no Google
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
} as const

export type Brand = typeof brand
