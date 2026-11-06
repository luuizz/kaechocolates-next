import type { Metadata } from 'next'
import { ProductList } from '@/components/admin/product-list'

export const metadata: Metadata = { title: 'Produtos' }

export default function AdminProducts() {
  return <ProductList />
}
