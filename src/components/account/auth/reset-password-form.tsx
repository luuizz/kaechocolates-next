'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormMessage } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthUnavailable } from '../auth-unavailable'
import { PasswordField, Submit } from './form-parts'
import { PASSWORD_MIN } from '@/constants/limits'

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
  if (!token)
    return (
      <FormMessage>
        Link inválido.{' '}
        <Link href="/recuperar-senha" className="font-semibold underline">
          Peça um novo
        </Link>
        .
      </FormMessage>
    )

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < PASSWORD_MIN) return setError(`A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`)
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
      <PasswordField
        label="Nova senha"
        hint={`Pelo menos ${PASSWORD_MIN} caracteres.`}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <PasswordField label="Repita a nova senha" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <Submit busy={busy}>Salvar nova senha</Submit>
    </form>
  )
}
