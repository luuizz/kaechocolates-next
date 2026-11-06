import type { Metadata } from 'next'
import { OrderDetail } from '@/components/admin/order-detail'

export const metadata: Metadata = { title: 'Pedido' }

export default async function AdminOrder({ params }: { params: Promise<{ code: string }> }) {
  return <OrderDetail code={(await params).code} />
}
