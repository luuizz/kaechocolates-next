import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/account/auth-shell'
import { ForgotPasswordForm } from '@/components/account/auth-forms'
import { getCatalog } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Recuperar senha', robots: { index: false } }

export default async function ForgotPasswordPage() {
  const { products } = await getCatalog()
  return (
    <AuthShell title="Recuperar senha" description="Mandamos um link para você criar uma senha nova." products={products} footer={<>Lembrou? <Link href="/entrar" className="font-semibold text-foreground underline-offset-4 hover:underline">Voltar para o login</Link></>}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
