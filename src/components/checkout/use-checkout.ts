'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { toCheckoutItems, useCart } from '@/components/cart/cart-provider'
import { validCpf } from '@/lib/cpf'
import type { Address } from '@/types/account'
import type { Quote } from '@/types/shipping'
import { getQuote, placeOrder } from '@/actions/checkout'
import { expectOk } from '@/lib/result'

export type PaymentMethod = 'pix' | 'card'

// Estado do checkout: endereço, prévia calculada no servidor e pagamento
export function useCheckout() {
  const auth = useAuth()
  const cart = useCart()
  const router = useRouter()
  const [address, setAddress] = useState<Address | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)

  const items = useMemo(() => toCheckoutItems(cart.items), [cart.items])
  const addressId = address?.id ?? null

  useEffect(() => {
    if (auth.configured && !auth.loading && !auth.user) router.replace('/entrar?volta=/checkout')
  }, [auth.configured, auth.loading, auth.user, router])

  // Recalcula no servidor sempre que a sacola ou o estado de entrega mudam
  const state = address?.state ?? null
  const itemsKey = JSON.stringify(items)
  useEffect(() => {
    if (!items.length) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicador de carregamento da prévia
    setQuoting(true)
    getQuote({ items, state })
      .then((result) => {
        const data = expectOk(result)
        if (active) setQuote(data)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setQuoting(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsKey representa items
  }, [itemsKey, state])

  const pay = async (payload: { method: PaymentMethod; cpf: string; card?: Record<string, unknown> }) => {
    setError('')
    const { code } = expectOk(await placeOrder({ items, addressId, ...payload }))
    setDone(true)
    cart.clear()
    // Se o status ainda está sendo gravado, a página do pedido acompanha
    router.push(`/pedido/${code}`)
  }

  const payPix = async () => {
    const digits = cpf.replace(/\D/g, '')
    if (!validCpf(digits)) return setError('Informe um CPF válido. Ele vai na nota fiscal e é exigido pelo Pix.')
    setPaying(true)
    try {
      await pay({ method: 'pix', cpf: digits })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o Pix.')
      setPaying(false)
    }
  }

  const payCard = (card: Record<string, unknown>, cpfNumber: string) => pay({ method: 'card', cpf: cpfNumber, card })

  const chooseMethod = (value: PaymentMethod) => {
    setMethod(value)
    setError('')
  }

  const problems = quote?.problems ?? []
  const ready = Boolean(address && quote && quote.zone && !problems.length && !quoting)
  const loading = !auth.configured || auth.loading || !auth.user
  const empty = !cart.items.length && !done

  return {
    email: auth.user?.email ?? '',
    cartItems: cart.items,
    loading,
    empty,
    ready,
    problems,
    address,
    setAddress,
    quote,
    quoting,
    method,
    chooseMethod,
    cpf,
    setCpf,
    error,
    setError,
    paying,
    payPix,
    payCard,
  }
}
