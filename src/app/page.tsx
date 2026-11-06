import { Hero } from '@/components/home/hero'
import { Marquee } from '@/components/home/marquee'
import { FlavorRail } from '@/components/home/flavor-rail'
import { BeanToBar } from '@/components/home/bean-to-bar'
import { ClubTeaser } from '@/components/home/club-teaser'
import { Quality } from '@/components/home/quality'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={['Chocolate com axé e borogodó']} className="-rotate-1 bg-foreground text-background" />
      <FlavorRail />
      <BeanToBar />
      <ClubTeaser />
      <Marquee items={['Um Brasil em cada barra']} className="rotate-1 bg-flavor-yellow text-foreground" invertIcon={false} />
      <Quality />
    </>
  )
}
