import type { Metadata } from 'next'
import { ProductEditor } from '@/components/admin/product-editor'

export const metadata: Metadata = { title: 'Produto' }

export default async function AdminProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductEditor id={id === 'novo' ? null : Number(id)} />
}
