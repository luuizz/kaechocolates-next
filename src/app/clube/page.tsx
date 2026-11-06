import type { Metadata } from 'next'
import { ComingSoon } from '@/components/layout/coming-soon'

export const metadata: Metadata = { title: 'Clube de assinatura' }

export default function Page() {
  return <ComingSoon title="Clube de assinatura" />
}
