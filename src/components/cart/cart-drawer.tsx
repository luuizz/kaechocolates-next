'use client'

import Link from 'next/link'
import { Dialog } from 'radix-ui'
import { ShoppingBagOpen, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/data/products'
import { useCart } from './cart-provider'
import { CartLine } from './cart-line'
import { FreeShipping } from './free-shipping'

// Sacola lateral: abre ao adicionar um produto ou ao clicar no ícone
export function CartDrawer() {
  const { items, count, subtotal, open, setOpen } = useCart()
  const close = () => setOpen(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-300">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="font-display text-xl font-extrabold">Sua sacola {count > 0 && <span className="text-muted-foreground">({count})</span>}</Dialog.Title>
            <Dialog.Close className="grid size-10 place-items-center rounded-full hover:bg-secondary" aria-label="Fechar sacola">
              <X size={20} weight="bold" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Produtos que você adicionou e o total da compra.</Dialog.Description>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="grid size-20 place-items-center rounded-full bg-secondary"><ShoppingBagOpen size={36} weight="duotone" /></span>
              <p className="font-display text-xl font-bold">Sua sacola está vazia</p>
              <p className="text-sm text-muted-foreground">Que tal começar pelo nosso mais premiado?</p>
              <Button asChild onClick={close}><Link href="/produtos">Ver chocolates</Link></Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5">
                <div className="pt-4"><FreeShipping subtotal={subtotal} /></div>
                <ul className="divide-y">{items.map((item) => <CartLine key={item.id} item={item} onNavigate={close} />)}</ul>
              </div>
              <div className="border-t px-5 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <strong className="font-display text-2xl">{formatBRL(subtotal)}</strong>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Frete calculado no próximo passo.</p>
                <div className="mt-4 grid gap-2">
                  <Button asChild size="lg" onClick={close}><Link href="/checkout">Finalizar compra</Link></Button>
                  <Button variant="ghost" onClick={close}>Continuar comprando</Button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
