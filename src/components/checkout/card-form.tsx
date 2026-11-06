'use client'

import { useState } from 'react'
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react'
import { CircleNotch, Plugs } from '@phosphor-icons/react'
import { brand } from '@/config/brand'

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? ''
// Inicializa o SDK uma vez, só no navegador
if (typeof window !== 'undefined' && publicKey) initMercadoPago(publicKey, { locale: 'pt-BR' })

// Formulário de cartão do próprio Mercado Pago (Card Payment Brick): os dados do
// cartão vão direto para eles e voltam como um token de uso único.
export function CardForm({ amount, email, onPay, onError }: {
  amount: number
  email: string
  onPay: (card: { token: string; paymentMethodId: string; paymentTypeId?: string; installments: number; issuerId?: string }, cpf: string) => Promise<void>
  onError: (message: string) => void
}) {
  const [ready, setReady] = useState(false)

  if (!publicKey) {
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm">
        <Plugs size={22} weight="duotone" className="shrink-0" /> Pagamento com cartão indisponível neste ambiente: falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.
      </p>
    )
  }
  return (
    <div className="relative min-h-80">
      {!ready && <div className="absolute inset-0 grid place-items-center"><CircleNotch size={28} className="animate-spin text-muted-foreground" aria-label="Carregando formulário do cartão" /></div>}
      <CardPayment
        key={amount}
        locale="pt-BR"
        initialization={{ amount, payer: { email } }}
        customization={{
          paymentMethods: { maxInstallments: brand.commerce.maxInstallments, types: { excluded: ['debit_card', 'prepaid_card'] } },
          visual: { style: { theme: 'default', customVariables: { baseColor: '#111111', borderRadiusMedium: '12px', borderRadiusLarge: '20px', fontWeightSemiBold: '600' } }, texts: { formSubmit: 'Pagar com cartão' } },
        }}
        onReady={() => setReady(true)}
        onError={(error) => {
          console.error('[cartão]', error)
          if (error.type === 'critical') onError('Não foi possível carregar o formulário do cartão. Recarregue a página.')
        }}
        onSubmit={async (form, extra) => {
          try {
            await onPay(
              { token: form.token, paymentMethodId: form.payment_method_id, paymentTypeId: extra?.paymentTypeId, installments: form.installments, issuerId: form.issuer_id },
              form.payer.identification?.number ?? '',
            )
          } catch (error) {
            onError(error instanceof Error ? error.message : 'O pagamento não foi aprovado.')
            throw error // devolve o formulário ao estado de edição
          }
        }}
      />
    </div>
  )
}
