import type { Metadata } from 'next'
import { OrderList } from '@/components/admin/order-list'

export const metadata: Metadata = { title: 'Pedidos' }

export default function AdminOrders() {
  return <OrderList />
}
