import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SubscribePage } from '@/components/club/subscribe-page'

export const metadata: Metadata = { title: 'Assinar o clube', robots: { index: false } }

export default function Subscribe() {
  return (
    <Suspense>
      <SubscribePage />
    </Suspense>
  )
}
