'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthUnavailable } from '../auth-unavailable'
import { EMAIL, safeNext, PasswordField, Submit } from './form-parts'

export function SignInForm() {
  const auth = useAuth()
  const router = useRouter()
  const next = safeNext(useSearchParams().get('volta'))
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Já logado: segue direto
  useEffect(() => {
    if (!auth.loading && auth.user) router.replace(next)
  }, [auth.loading, auth.user, next, router])

  if (!auth.configured) return <AuthUnavailable />

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!EMAIL.test(form.email.trim()) || !form.password) return setError('Preencha e-mail e senha.')
    setBusy(true)
    try {
      await auth.signIn(form.email.trim(), form.password)
      router.replace(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <Field label="E-mail"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></Field>
      <PasswordField label="Senha" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="current-password" />
      <Link href="/recuperar-senha" className="-mt-1 self-end text-sm font-semibold underline-offset-4 hover:underline">Esqueci minha senha</Link>
      <Submit busy={busy}>Entrar</Submit>
    </form>
  )
}
