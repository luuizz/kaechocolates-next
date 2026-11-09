'use client'

import { useState } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { TabTitle } from '../tab-title'
import { useFormFeedback } from '../use-form-feedback'

const EMPTY = { current: '', next: '', confirm: '' }

export function PasswordTab() {
  const auth = useAuth()
  const [form, setForm] = useState(EMPTY)
  const { message, busy, fail, clear, run } = useFormFeedback()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    clear()
    if (!form.current) return fail('Informe a senha atual.')
    if (form.next.length < 8) return fail('A nova senha precisa ter pelo menos 8 caracteres.')
    if (form.next !== form.confirm) return fail('As senhas não conferem.')
    run(
      async () => {
        await auth.changePassword(form.current, form.next)
        setForm(EMPTY)
      },
      'Senha trocada.',
      'Não foi possível trocar a senha.',
    )
  }

  return (
    <>
      <TabTitle>Senha</TabTitle>
      <form onSubmit={submit} noValidate className="flex max-w-lg flex-col gap-4">
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
        <Field label="Senha atual">
          <Input
            type="password"
            value={form.current}
            onChange={(event) => setForm({ ...form, current: event.target.value })}
            autoComplete="current-password"
          />
        </Field>
        <Field label="Nova senha" hint="Pelo menos 8 caracteres.">
          <Input
            type="password"
            value={form.next}
            onChange={(event) => setForm({ ...form, next: event.target.value })}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Repita a nova senha">
          <Input
            type="password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" size="lg" className="self-start" disabled={busy}>
          {busy && <CircleNotch className="animate-spin" />} Trocar senha
        </Button>
      </form>
    </>
  )
}
