import type { OrderStatus } from '@/types/order'

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string; text: string }> = {
  pending_payment: {
    label: 'Aguardando pagamento',
    tone: 'bg-flavor-yellow text-foreground',
    text: 'Assim que o pagamento for aprovado, a gente começa a separar.',
  },
  paid: {
    label: 'Pagamento aprovado',
    tone: 'bg-success text-white',
    text: 'Pagamento confirmado! Já já começamos a separar seu pedido.',
  },
  preparing: {
    label: 'Em separação',
    tone: 'bg-flavor-blue text-white',
    text: 'Estamos embalando seu pedido com todo o cuidado.',
  },
  shipped: { label: 'Enviado', tone: 'bg-flavor-orange text-white', text: 'Seu pedido está a caminho.' },
  delivered: { label: 'Entregue', tone: 'bg-foreground text-background', text: 'Pedido entregue. Bom proveito!' },
  canceled: { label: 'Cancelado', tone: 'bg-destructive text-white', text: 'Este pedido foi cancelado.' },
}

// Linha do tempo mostrada ao cliente (cancelado fica de fora)
export const ORDER_STEPS: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered']

// Próximo passo sugerido no painel para cada status
export const ORDER_NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'preparing',
  preparing: 'shipped',
  shipped: 'delivered',
}
