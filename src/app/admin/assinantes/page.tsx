import type { Metadata } from 'next'
import { SubscriberList } from '@/components/admin/subscriber-list'

export const metadata: Metadata = { title: 'Assinantes' }

export default function AdminSubscribers() {
  return <SubscriberList />
}
