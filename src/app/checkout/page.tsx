import type { Metadata } from 'next'
import { CheckoutPage } from '@/components/checkout/checkout-page'

export const metadata: Metadata = { title: 'Finalizar compra', robots: { index: false } }

export default function Checkout() {
  return <CheckoutPage />
}
