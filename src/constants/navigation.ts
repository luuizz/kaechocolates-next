import {
  Barcode,
  Gauge,
  IdentificationCard,
  Key,
  MapPin,
  Package,
  Receipt,
  Sparkle,
  Truck,
  UserCircleCheck,
  Users,
} from '@phosphor-icons/react'

export const ADMIN_NAV = [
  { href: '/admin', label: 'Visão geral', icon: Gauge, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: Receipt },
  { href: '/admin/produtos', label: 'Produtos', icon: Barcode },
  { href: '/admin/kits', label: 'Caixas de kit', icon: Package },
  { href: '/admin/assinantes', label: 'Assinantes', icon: UserCircleCheck },
  { href: '/admin/clube', label: 'Planos do clube', icon: Sparkle },
  { href: '/admin/frete', label: 'Frete', icon: Truck },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

export const ACCOUNT_TABS = [
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'clube', label: 'Clube', icon: Sparkle },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
  { id: 'dados', label: 'Meus dados', icon: IdentificationCard },
  { id: 'senha', label: 'Senha', icon: Key },
] as const
