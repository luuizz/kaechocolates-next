import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthShell } from '@/components/account/auth-shell'
import { ResetPasswordForm } from '@/components/account/auth/reset-password-form'
import { getCatalog } from '@/lib/server/catalog'

export const metadata: Metadata = { title: 'Nova senha', robots: { index: false } }

export default async function ResetPasswordPage() {
  const { products } = await getCatalog()
  return (
    <AuthShell title="Nova senha" products={products}>
      <Suspense><ResetPasswordForm /></Suspense>
    </AuthShell>
  )
}
