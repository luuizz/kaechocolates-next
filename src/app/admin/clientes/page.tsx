import type { Metadata } from 'next'
import { CustomerList } from '@/components/admin/customer-list'

export const metadata: Metadata = { title: 'Clientes' }

export default function AdminCustomers() {
  return <CustomerList />
}
