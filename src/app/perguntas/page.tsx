import type { Metadata } from 'next'
import { ComingSoon } from '@/components/layout/coming-soon'

export const metadata: Metadata = { title: 'Perguntas dos chocólatras' }

export default function Page() {
  return <ComingSoon title="Perguntas dos chocólatras" />
}
