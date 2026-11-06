import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/account/auth-shell'
import { SignInForm } from '@/components/account/auth-forms'
import { getCatalog } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } }

export default async function SignInPage() {
  const { products } = await getCatalog()
  return (
    <AuthShell title="Entrar" description="Acompanhe pedidos, salve endereços e gerencie o clube." products={products} footer={<>Ainda não tem conta? <Link href="/cadastro" className="font-semibold text-foreground underline-offset-4 hover:underline">Criar conta</Link></>}>
      <Suspense><SignInForm /></Suspense>
    </AuthShell>
  )
}
