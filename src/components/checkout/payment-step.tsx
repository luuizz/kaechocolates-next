'use client'

import { CircleNotch, CreditCard, PixLogo } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Field, FormMessage, Input } from '@/components/ui/field'
import { formatBRL } from '@/data/products'
import { formatCpf } from '@/lib/cpf'
import { cn } from '@/lib/utils'
import { CardForm } from './card-form'
import type { PaymentMethod } from './use-checkout'
import type { Quote } from '@/types/shipping'

type PaymentStepProps = {
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  quote: Quote | null
  ready: boolean
  email: string
  cpf: string
  onCpfChange: (cpf: string) => void
  error: string
  onError: (message: string) => void
  paying: boolean
  onPayPix: () => void
  onPayCard: (card: Record<string, unknown>, cpf: string) => Promise<void>
}

const METHODS = [['pix', 'Pix', PixLogo], ['card', 'Cartão de crédito', CreditCard]] as const

export function PaymentStep({ method, onMethodChange, quote, ready, email, cpf, onCpfChange, error, onError, paying, onPayPix, onPayCard }: PaymentStepProps) {
  return (
    <>
      <div role="tablist" aria-label="Forma de pagamento" className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
        {METHODS.map(([value, label, MethodIcon]) => (
          <button key={value} type="button" role="tab" aria-selected={method === value} onClick={() => onMethodChange(value)} className={cn('flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors', method === value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <MethodIcon size={20} weight={method === value ? 'fill' : 'regular'} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <FormMessage>{error}</FormMessage>
        {method === 'pix' ? (
          <div className={cn('flex flex-col gap-4', error && 'mt-4')}>
            <p className="text-sm text-muted-foreground">Você recebe o QR Code e o código copia e cola na próxima tela. O Pix vale por 30 minutos e a aprovação é na hora.</p>
            <Field label="CPF" hint="Vai na nota fiscal e é exigido pelo Pix.">
              <Input value={formatCpf(cpf)} onChange={(event) => onCpfChange(event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" className="max-w-xs" />
            </Field>
            <Button size="lg" className="self-start" disabled={!ready || paying} onClick={onPayPix}>
              {paying ? <CircleNotch className="animate-spin" /> : <PixLogo weight="bold" />} Pagar {quote ? formatBRL(quote.total) : ''} com Pix
            </Button>
          </div>
        ) : ready && quote ? (
          <div className={cn(error && 'mt-4')}>
            <CardForm amount={quote.total} email={email} onPay={onPayCard} onError={onError} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Escolha o endereço para liberar o pagamento com cartão.</p>
        )}
      </div>
    </>
  )
}
