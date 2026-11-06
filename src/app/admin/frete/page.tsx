import type { Metadata } from 'next'
import { ShippingEditor } from '@/components/admin/shipping-editor'

export const metadata: Metadata = { title: 'Frete' }

export default function AdminShipping() {
  return <ShippingEditor />
}
