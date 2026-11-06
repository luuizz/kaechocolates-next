import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthShell } from '@/components/account/auth-shell'
import { ResetPasswordForm } from '@/components/account/auth-forms'
import { getCatalog } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Nova senha' }

export default async function ResetPasswordPage() {
  const { products } = await getCatalog()
  return (
    <AuthShell title="Nova senha" products={products}>
      <Suspense><ResetPasswordForm /></Suspense>
    </AuthShell>
  )
}
