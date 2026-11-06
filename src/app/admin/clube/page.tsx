import type { Metadata } from 'next'
import { ClubEditor } from '@/components/admin/club-editor'

export const metadata: Metadata = { title: 'Clube' }

export default function AdminClub() {
  return <ClubEditor />
}
