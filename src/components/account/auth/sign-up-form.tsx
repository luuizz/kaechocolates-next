'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthUnavailable } from '../auth-unavailable'
import { EMAIL, MIN_PASSWORD, safeNext, PasswordField, Submit } from './form-parts'

export function SignUpForm() {
  const auth = useAuth()
  const router = useRouter()
  const next = safeNext(useSearchParams().get('volta'))
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [tried, setTried] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!auth.configured) return <AuthUnavailable />

  const errors = {
    name: form.name.trim().length < 2 ? 'Conta pra gente seu nome.' : null,
    email: !EMAIL.test(form.email.trim()) ? 'Informe um e-mail válido.' : null,
    password: form.password.length < MIN_PASSWORD ? `Use pelo menos ${MIN_PASSWORD} caracteres.` : null,
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setTried(true)
    setError('')
    if (Object.values(errors).some(Boolean)) return
    setBusy(true)
    try {
      const { needsConfirmation } = await auth.signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      if (needsConfirmation) {
        setDone(true)
        setBusy(false)
      } else {
        router.replace(next)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
      setBusy(false)
    }
  }

  if (done) return <FormMessage tone="success">Conta criada! Enviamos um link de confirmação para {form.email}. Depois de confirmar, é só entrar.</FormMessage>

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <Field label="Nome" error={tried ? errors.name : null}><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" required /></Field>
      <Field label="E-mail" error={tried ? errors.email : null}><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></Field>
      <PasswordField label="Senha" hint={`Pelo menos ${MIN_PASSWORD} caracteres.`} error={tried ? errors.password : null} value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password" />
      <p className="text-xs text-muted-foreground">Ao criar a conta você concorda com os <Link href="/termos" className="underline">termos de uso</Link> e a <Link href="/politica-privacidade" className="underline">política de privacidade</Link>.</p>
      <Submit busy={busy}>Criar conta</Submit>
    </form>
  )
}
