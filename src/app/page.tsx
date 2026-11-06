import { Bento } from '@/components/home/bento'
import { Benefits } from '@/components/home/benefits'
import { CatalogSection } from '@/components/home/catalog-section'
import { About } from '@/components/home/about'
import { ClubTeaser } from '@/components/home/club-teaser'
import { Reviews } from '@/components/home/reviews'
import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { JsonLd, organization, website } from '@/lib/seo/json-ld'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default async function Home() {
  const { products } = await getCatalog()
  return (
    <>
      <JsonLd data={[organization(), website()]} />
      <Bento products={products} />
      <Benefits />
      <CatalogSection />
      <About />
      <ClubTeaser products={products} />
      {/* Avaliações entram quando houver dados reais */}
      <Reviews reviews={[]} />
    </>
  )
}
