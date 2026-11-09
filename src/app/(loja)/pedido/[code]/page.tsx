import type { Metadata } from 'next'
import { OrderPage } from '@/components/orders/order-page'

export const metadata: Metadata = { title: 'Pedido', robots: { index: false } }

export default async function Order({ params }: { params: Promise<{ code: string }> }) {
  return <OrderPage code={(await params).code} />
}
