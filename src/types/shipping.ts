export type Quote = {
  items: { kind: 'product' | 'kit'; name: string; quantity: number; unit_price: number; total: number }[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  zone: { id: string; name: string; price: number; days_min: number; days_max: number } | null
  free_from: number
  problems: string[]
}

export type AdminZone = {
  id: string
  name: string
  states: string[]
  price: number
  days_min: number
  days_max: number
  active: boolean
  sort_order: number
}
