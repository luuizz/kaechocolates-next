import { Bento } from '@/components/home/bento'
import { Benefits } from '@/components/home/benefits'
import { CatalogSection } from '@/components/home/catalog-section'
import { About } from '@/components/home/about'
import { ClubTeaser } from '@/components/home/club-teaser'
import { Reviews } from '@/components/home/reviews'
import { getCatalog } from '@/lib/catalog'

export default async function Home() {
  const { products } = await getCatalog()
  return (
    <>
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
