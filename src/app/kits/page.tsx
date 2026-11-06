import type { Metadata } from 'next'
import { ComingSoon } from '@/components/layout/coming-soon'

export const metadata: Metadata = { title: 'Kits' }

export default function Page() {
  return <ComingSoon title="Kits" />
}
