import { CreditCard, Gift, ShieldCheck, Truck } from '@phosphor-icons/react/dist/ssr'
import { brand } from '@/config/brand'

const items = [
  {
    icon: Truck,
    title: `Frete grátis acima de R$ ${brand.commerce.freeShippingFrom}`,
    text: 'Enviamos para todo o Brasil',
  },
  { icon: CreditCard, title: `Até ${brand.commerce.maxInstallments}x sem juros`, text: 'Pix, cartão ou boleto' },
  { icon: Gift, title: 'Embalagem para presente', text: 'Com cartão escrito à mão' },
  { icon: ShieldCheck, title: 'Compra segura', text: 'Pagamento pelo Mercado Pago' },
]

// Faixa de benefícios da loja
export function Benefits() {
  return (
    <section aria-label="Benefícios" className="mx-auto max-w-7xl px-5 pt-6 md:px-8">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 bg-background p-4 md:p-5">
            <Icon size={30} weight="duotone" className="shrink-0" />
            <div>
              <p className="text-sm leading-tight font-bold">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
