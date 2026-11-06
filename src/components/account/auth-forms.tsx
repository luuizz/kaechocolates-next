'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthUnavailable } from './auth-unavailable'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

// Só volta para caminhos internos (evita redirecionar para outro site)
export function safeNext(value: string | null, fallback = '/conta') {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? 'Esconder senha' : 'Mostrar senha'} className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
        {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

// Field passa id/aria para o filho direto; aqui o filho é o wrapper do campo de senha
function PasswordField({ label, value, onChange, error, autoComplete, hint }: { label: string; value: string; onChange: (value: string) => void; error?: string | null; autoComplete: string; hint?: string }) {
  return (
    <Field label={label} error={error} hint={hint}>
      <PasswordInput value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required />
    </Field>
  )
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={busy}>
      {busy && <CircleNotch className="animate-spin" weight="bold" />} {children}
    </Button>
  )
}

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

export function ForgotPasswordForm() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!auth.configured) return <AuthUnavailable />

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!EMAIL.test(email.trim())) return setError('Informe um e-mail válido.')
    setBusy(true)
    try {
      await auth.requestPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o link.')
    }
    setBusy(false)
  }

  if (sent) return <FormMessage tone="success">Se existir uma conta com {email.trim()}, você vai receber um link para criar uma nova senha em alguns minutos.</FormMessage>

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <Field label="E-mail da conta"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></Field>
      <Submit busy={busy}>Enviar link</Submit>
    </form>
  )
}

export function ResetPasswordForm() {
  const auth = useAuth()
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!auth.configured) return <AuthUnavailable />
  if (!token) return <FormMessage>Link inválido. <Link href="/recuperar-senha" className="font-semibold underline">Peça um novo</Link>.</FormMessage>

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < MIN_PASSWORD) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`)
    if (password !== confirm) return setError('As senhas não conferem.')
    setBusy(true)
    try {
      await auth.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.replace('/entrar'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível trocar a senha.')
    }
    setBusy(false)
  }

  if (done) return <FormMessage tone="success">Senha trocada! Levando você para o login…</FormMessage>

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <PasswordField label="Nova senha" hint={`Pelo menos ${MIN_PASSWORD} caracteres.`} value={password} onChange={setPassword} autoComplete="new-password" />
      <PasswordField label="Repita a nova senha" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <Submit busy={busy}>Salvar nova senha</Submit>
    </form>
  )
}
