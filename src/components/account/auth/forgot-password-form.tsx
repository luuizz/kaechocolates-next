'use client'

import { useState } from 'react'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthUnavailable } from '../auth-unavailable'
import { EMAIL, Submit } from './form-parts'

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

  if (sent)
    return (
      <FormMessage tone="success">
        Se existir uma conta com {email.trim()}, você vai receber um link para criar uma nova senha em alguns minutos.
      </FormMessage>
    )

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormMessage>{error}</FormMessage>
      <Field label="E-mail da conta">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </Field>
      <Submit busy={busy}>Enviar link</Submit>
    </form>
  )
}
