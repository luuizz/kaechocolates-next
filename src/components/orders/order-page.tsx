'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, CircleNotch, Copy, PixLogo, WarningCircle, XCircle } from '@phosphor-icons/react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { getAccessToken } from '@/lib/neon'
import { formatDateTime, paymentProblem } from '@/lib/orders'
import { OrderItems, OrderProgress, OrderShipping, StatusBadge } from './order-parts'
import type { OrderView } from '@/types/order'
import { PageLoader } from '@/components/ui/page-loader'
import { ORDER_STATUS } from '@/constants/orders'

// Página do pedido: Pix para pagar (com atualização automática) ou o andamento
export function OrderPage({ code }: { code: string }) {
  const auth = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (auth.configured && !auth.loading && !auth.user) router.replace(`/entrar?volta=/pedido/${code}`)
  }, [auth.configured, auth.loading, auth.user, code, router])

  const load = useCallback(async () => {
    const token = await getAccessToken()
    const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Não foi possível carregar o pedido.')
    setOrder(body.order)
    return body.order as OrderView
  }, [code])

  useEffect(() => {
    if (!auth.user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial do pedido
    load().catch((err) => setError(err.message))
  }, [auth.user, load])

  // Enquanto o Pix não é pago, confere a cada 5 segundos
  const pending = order?.status === 'pending_payment'
  useEffect(() => {
    if (!pending) return
    const timer = setInterval(() => load().catch(() => {}), 5000)
    return () => clearInterval(timer)
  }, [pending, load])

  if (error)
    return (
      <Centered>
        <WarningCircle size={40} className="text-destructive" />
        <p className="mt-3">{error}</p>
        <Button asChild className="mt-5">
          <Link href="/conta">Ir para minha conta</Link>
        </Button>
      </Centered>
    )
  if (!order) return <PageLoader height="page" />

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-24 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/conta?aba=pedidos" className="hover:text-foreground">
          Meus pedidos
        </Link>{' '}
        <span aria-hidden="true">/</span> <span className="text-foreground">{order.code}</span>
      </nav>

      <Hero order={order} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-card border p-5 md:p-7">
          <h2 className="font-display text-xl font-extrabold">Itens</h2>
          <div className="mt-2">
            <OrderItems order={order} />
          </div>
        </section>
        <section className="rounded-card border p-5 md:p-7 lg:self-start">
          <h2 className="mb-4 font-display text-xl font-extrabold">Entrega</h2>
          <OrderShipping order={order} />
        </section>
      </div>
    </div>
  )
}

function Hero({ order }: { order: OrderView }) {
  if (order.status === 'pending_payment' && order.payment_method === 'pix' && order.pix_qr_code)
    return <PixBox order={order} />

  const canceled = order.status === 'canceled'
  return (
    <header className={`mt-6 rounded-feature p-6 md:p-10 ${canceled ? 'bg-secondary' : 'bg-flavor-yellow'}`}>
      {canceled ? (
        <XCircle size={44} weight="fill" className="text-destructive" />
      ) : (
        <CheckCircle size={44} weight="fill" />
      )}
      <h1 className="mt-4 font-display text-4xl leading-display font-extrabold tracking-display md:text-5xl">
        {canceled
          ? 'Pedido cancelado'
          : order.status === 'pending_payment'
            ? 'Pedido recebido'
            : 'Obrigado pela compra!'}
      </h1>
      <p className="mt-3 max-w-xl text-foreground/80">
        {canceled && order.payment_detail ? paymentProblem(order.payment_detail) : ORDER_STATUS[order.status].text}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status={order.status} />
        <span>
          Pedido <strong>{order.code}</strong> · {formatDateTime(order.created_at)}
        </span>
      </div>
      {!canceled && (
        <div className="mt-6 max-w-2xl">
          <OrderProgress status={order.status} />
        </div>
      )}
      {canceled && (
        <Button asChild className="mt-6">
          <Link href="/produtos">Voltar para a loja</Link>
        </Button>
      )}
    </header>
  )
}

function PixBox({ order }: { order: OrderView }) {
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const left = order.pix_expires_at ? Math.max(0, new Date(order.pix_expires_at).getTime() - now) : null
  const minutes =
    left === null ? null : `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`

  const copy = async () => {
    await navigator.clipboard.writeText(order.pix_qr_code!).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <header className="mt-6 grid items-center gap-8 rounded-feature bg-secondary p-6 md:grid-cols-[1fr_auto] md:p-10">
      <div>
        <PixLogo size={44} weight="fill" className="text-pix" />
        <h1 className="mt-4 font-display text-4xl leading-display font-extrabold tracking-display md:text-5xl">
          Falta só pagar o Pix
        </h1>
        <p className="mt-3 max-w-md text-foreground/80">
          Abra o app do seu banco, escolha pagar com Pix e escaneie o QR Code ou use o código copia e cola. Esta página
          atualiza sozinha quando o pagamento cair.
        </p>
        <p className="mt-4 text-sm">
          Pedido <strong>{order.code}</strong>
          {minutes && (
            <>
              {' '}
              · expira em <strong className="tabular-nums">{minutes}</strong>
            </>
          )}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="lg" onClick={copy}>
            {copied ? <CheckCircle weight="fill" /> : <Copy weight="bold" />}{' '}
            {copied ? 'Código copiado!' : 'Copiar código Pix'}
          </Button>
          {order.pix_ticket_url && (
            <Button asChild size="lg" variant="outline">
              <a href={order.pix_ticket_url} target="_blank" rel="noreferrer">
                Abrir no Mercado Pago
              </a>
            </Button>
          )}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <CircleNotch size={16} className="animate-spin" /> Aguardando o pagamento…
        </p>
      </div>
      {order.pix_qr_base64 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${order.pix_qr_base64}`}
          alt="QR Code do Pix"
          width={240}
          height={240}
          className="mx-auto size-60 rounded-2xl bg-white p-3"
        />
      )}
    </header>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      {children}
    </div>
  )
}
