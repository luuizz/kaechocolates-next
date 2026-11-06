import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthShell } from '@/components/account/auth-shell'
import { SignUpForm } from '@/components/account/auth-forms'
import { getCatalog } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Criar conta', robots: { index: false } }

export default async function SignUpPage() {
  const { products } = await getCatalog()
  return (
    <AuthShell title="Criar conta" description="Leva menos de um minuto." products={products} footer={<>Já tem conta? <Link href="/entrar" className="font-semibold text-foreground underline-offset-4 hover:underline">Entrar</Link></>}>
      <Suspense><SignUpForm /></Suspense>
    </AuthShell>
  )
}
