import { Bento } from '@/components/home/bento'
import { Benefits } from '@/components/home/benefits'
import { CatalogSection } from '@/components/home/catalog-section'
import { About } from '@/components/home/about'
import { ClubTeaser } from '@/components/home/club-teaser'
import { Reviews } from '@/components/home/reviews'

export default function Home() {
  return (
    <>
      <Bento />
      <Benefits />
      <CatalogSection />
      <About />
      <ClubTeaser />
      {/* Avaliações entram quando houver dados reais (fase 2) */}
      <Reviews reviews={[]} />
    </>
  )
}
