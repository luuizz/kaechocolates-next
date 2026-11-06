import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AccountPage } from '@/components/account/account-page'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = { title: 'Minha conta', robots: { index: false } }

export default function Account() {
  return (
    <>
      <PageHeader title="Minha conta" />
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8">
        <Suspense><AccountPage /></Suspense>
      </div>
    </>
  )
}
