'use client'

import { useState } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { getNeon, unwrap } from '@/lib/neon'
import { formatPhone } from '@/lib/utils'
import { TabTitle } from '../tab-title'
import { useFormFeedback } from '../use-form-feedback'
import type { Profile } from '@/types/account'

export function ProfileTab() {
  const auth = useAuth()
  const [form, setForm] = useState({ full_name: auth.profile?.full_name ?? '', phone: auth.profile?.phone ?? '' })
  const { message, busy, fail, run } = useFormFeedback()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const profile = auth.profile
    if (!profile) return
    if (form.full_name.trim().length < 2) return fail('Informe seu nome.')
    run(
      async () => {
        const phone = form.phone.replace(/\D/g, '')
        const rows = unwrap(
          await getNeon()
            .from('profiles')
            .update({ full_name: form.full_name.trim(), phone: phone || null })
            .eq('id', profile.id)
            .select(),
        ) as Profile[]
        if (rows[0]) auth.setProfile(rows[0])
      },
      'Dados salvos.',
      'Não foi possível salvar.',
    )
  }

  return (
    <>
      <TabTitle description="Usados nos pedidos e para falarmos com você sobre a entrega.">Meus dados</TabTitle>
      <form onSubmit={submit} noValidate className="flex max-w-lg flex-col gap-4">
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
        <Field label="Nome completo">
          <Input
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            autoComplete="name"
          />
        </Field>
        <Field label="E-mail" hint="O e-mail é o login da conta e não pode ser trocado aqui.">
          <Input value={auth.user?.email ?? ''} disabled />
        </Field>
        <Field label="Celular (WhatsApp)" hint="Com DDD.">
          <Input
            value={formatPhone(form.phone)}
            onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(35) 99999-9999"
          />
        </Field>
        <Button type="submit" size="lg" className="self-start" disabled={busy}>
          {busy && <CircleNotch className="animate-spin" />} Salvar
        </Button>
      </form>
    </>
  )
}
