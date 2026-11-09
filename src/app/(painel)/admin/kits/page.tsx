import type { Metadata } from 'next'
import { BoxesEditor } from '@/components/admin/boxes-editor'

export const metadata: Metadata = { title: 'Caixas de kit' }

export default function AdminKits() {
  return <BoxesEditor />
}
