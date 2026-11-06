import { ComingSoon } from '@/components/layout/coming-soon'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ComingSoon title={slug} />
}
