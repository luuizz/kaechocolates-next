// Tudo o que identifica a marca fica aqui (e nas cores de src/app/globals.css).
// Para publicar como projeto genérico, basta trocar este arquivo, o logo em
// /public/brand e as fotos de produto.
export const brand = {
  name: 'Kaê Chocolates',
  shortName: 'Kaê',
  tagline: 'Um Brasil em cada barra',
  description:
    'Chocolate bean to bar brasileiro: do grão à barra, com cacau da Bahia, ingredientes amazônicos e jeitinho mineiro.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kaechocolates.luricweb.com.br',
  logo: {
    src: '/brand/logo.svg',
    inverted: '/brand/logo-negativo.svg',
    email: '/brand/logo-email.png',
    alt: 'Kaê Chocolates',
  },
  social: {
    instagram: 'https://www.instagram.com/kaechocolates/',
  },
  contact: {
    city: 'Varginha, MG',
    address: 'Praça Marechal Deodoro, 130, Centro · Varginha, MG · 37014-230',
    phone: '(35) 98477-3733',
    whatsapp: '5535984773733',
    email: 'contato@kaechocolates.com.br',
  },
  // Dados da empresa nas páginas de privacidade e termos. Confirmar com a Kaê.
  legal: {
    company: 'Kaê Chocolates',
    cnpj: '', // preencher; a linha some das páginas enquanto estiver vazio
    updatedAt: '2026-11-06',
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
