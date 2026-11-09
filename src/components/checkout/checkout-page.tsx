'use client'

import Link from 'next/link'
import { LockSimple, MapPin, ShoppingBagOpen, Truck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/page-loader'
import { AddressPicker } from './address-picker'
import { CheckoutStep } from './checkout-step'
import { DeliveryOption } from './delivery-option'
import { OrderSummary } from './order-summary'
import { PaymentStep } from './payment-step'
import { useCheckout } from './use-checkout'

// Checkout em uma página: endereço → entrega → pagamento, com o resumo calculado pelo servidor
export function CheckoutPage() {
  const checkout = useCheckout()

  if (checkout.loading) return <PageLoader height="page" />

  if (checkout.empty) {
    return (
      <EmptyState
        icon={<ShoppingBagOpen size={44} weight="duotone" />}
        title="Sua sacola está vazia"
        description="Escolha suas barras e volte aqui para finalizar."
        action={
          <Button asChild size="lg">
            <Link href="/produtos">Ver chocolates</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-24 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/carrinho" className="hover:text-foreground">
          Sacola
        </Link>{' '}
        <span aria-hidden="true">/</span> <span className="text-foreground">Finalizar compra</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl leading-display font-extrabold tracking-display md:text-6xl">
        Finalizar compra
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <div className="flex flex-col gap-6">
          <CheckoutStep number={1} title="Endereço de entrega" icon={MapPin}>
            <AddressPicker value={checkout.address} onChange={checkout.setAddress} />
          </CheckoutStep>

          <CheckoutStep number={2} title="Entrega" icon={Truck} muted={!checkout.address}>
            <DeliveryOption hasAddress={Boolean(checkout.address)} quote={checkout.quote} quoting={checkout.quoting} />
          </CheckoutStep>

          <CheckoutStep number={3} title="Pagamento" icon={LockSimple} muted={!checkout.ready}>
            <PaymentStep
              method={checkout.method}
              onMethodChange={checkout.chooseMethod}
              quote={checkout.quote}
              ready={checkout.ready}
              email={checkout.email}
              cpf={checkout.cpf}
              onCpfChange={checkout.setCpf}
              error={checkout.error}
              onError={checkout.setError}
              paying={checkout.paying}
              onPayPix={checkout.payPix}
              onPayCard={checkout.payCard}
            />
          </CheckoutStep>
        </div>

        <OrderSummary
          items={checkout.cartItems}
          quote={checkout.quote}
          quoting={checkout.quoting}
          problems={checkout.problems}
        />
      </div>
    </div>
  )
}
