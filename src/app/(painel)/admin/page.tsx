import type { Metadata } from 'next'
import { AdminOverview } from '@/components/admin/admin-overview'

export const metadata: Metadata = { title: 'Visão geral' }

export default function AdminHome() {
  return <AdminOverview />
}
