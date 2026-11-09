'use client'

import { useState } from 'react'
import { WhatsappLogo } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { brand } from '@/config/brand'

const subjects = [
  'Dúvida sobre um pedido',
  'Presentes e kits',
  'Clube de assinatura',
  'Revenda e atacado',
  'Outro assunto',
]
const field =
  'h-12 w-full rounded-xl border bg-background px-4 outline-none transition-[border-color,box-shadow] focus:border-foreground focus:ring-4 focus:ring-foreground/10 aria-invalid:border-destructive'

// Sem servidor por enquanto: o formulário monta a mensagem e abre o WhatsApp da Kaê
export function ContactForm() {
  const [form, setForm] = useState({ name: '', subject: subjects[0], order: '', message: '' })
  const [tried, setTried] = useState(false)
  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }))
  const invalid = { name: tried && !form.name.trim(), message: tried && form.message.trim().length < 5 }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!form.name.trim() || form.message.trim().length < 5) return
    const text = [
      `Olá! Sou ${form.name.trim()}.`,
      `Assunto: ${form.subject}`,
      form.order && `Pedido: ${form.order}`,
      '',
      form.message.trim(),
    ]
      .filter((line) => line !== '' && line !== undefined)
      .join('\n')
    window.open(`https://wa.me/${brand.contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-card border p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Seu nome
          <input
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            aria-invalid={invalid.name}
            className={field}
          />
          {invalid.name && <span className="text-xs font-normal text-destructive">Conta pra gente seu nome.</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Assunto
          <select value={form.subject} onChange={set('subject')} className={field}>
            {subjects.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Número do pedido{' '}
        <span className="-mt-1 text-xs font-normal text-muted-foreground">Se for sobre uma compra</span>
        <input value={form.order} onChange={set('order')} inputMode="numeric" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Mensagem
        <textarea
          value={form.message}
          onChange={set('message')}
          rows={5}
          aria-invalid={invalid.message}
          className={`${field} h-auto resize-y py-3`}
        />
        {invalid.message && <span className="text-xs font-normal text-destructive">Escreva sua mensagem.</span>}
      </label>
      <Button type="submit" size="lg" className="self-start">
        <WhatsappLogo weight="bold" /> Enviar pelo WhatsApp
      </Button>
    </form>
  )
}
