'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowsClockwise, CircleNotch, Copy, EnvelopeSimple, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/field'
import { OrderItems, OrderProgress, OrderShipping, StatusBadge } from '@/components/orders/order-parts'
import { getOrder, notifyOrderChange, refreshStore, updateOrder } from '@/lib/admin-api'
import { formatCpf } from '@/lib/cpf'
import { formatDateTime } from '@/lib/orders'
import { formatPhone } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-page'
import type { OrderStatus, OrderView } from '@/types/order'
import { PageLoader } from '@/components/ui/page-loader'
import { ORDER_STATUS } from '@/constants/orders'
import { ORDER_NEXT_STATUS } from '@/constants/orders'
import { getMyOrder } from '@/actions/orders'
import { expectOk } from '@/lib/result'

export function OrderDetail({ code }: { code: string }) {
  const [order, setOrder] = useState<OrderView | null>(null)
  const [status, setStatus] = useState<OrderStatus>('pending_payment')
  const [tracking, setTracking] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    const data = await getOrder(code)
    if (!data) throw new Error('Pedido não encontrado.')
    setOrder(data)
    setStatus(data.status)
    setTracking(data.tracking_code ?? '')
  }, [code])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial do pedido
    load().catch((err) => toast.error(err.message))
  }, [load])

  if (!order) return <PageLoader />

  const save = async (nextStatus = status, nextTracking = tracking) => {
    if (
      nextStatus === 'shipped' &&
      !nextTracking.trim() &&
      !window.confirm('Marcar como enviado sem código de rastreio?')
    )
      return
    if (
      nextStatus === 'canceled' &&
      order.status !== 'canceled' &&
      !window.confirm(
        `Cancelar o pedido ${order.code}? As barras voltam para o estoque. O estorno do pagamento é feito no painel do Mercado Pago.`,
      )
    )
      return
    setSaving(true)
    try {
      await updateOrder(order.id, nextStatus, nextTracking)
      if (nextStatus === 'canceled') await refreshStore().catch(() => {})
      if (nextStatus === 'shipped' || nextStatus === 'delivered')
        await notifyOrderChange(order.code).catch(() => toast.warning('Salvo, mas o e-mail para o cliente não saiu.'))
      toast.success(`Pedido ${ORDER_STATUS[nextStatus].label.toLowerCase()}.`)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
    setSaving(false)
  }

  const sync = async () => {
    setSyncing(true)
    try {
      expectOk(await getMyOrder(order.code))
      await load()
      toast.success('Pagamento conferido no Mercado Pago.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao consultar.')
    }
    setSyncing(false)
  }

  const next = ORDER_NEXT_STATUS[order.status]
  const c = order.customer

  return (
    <>
      <Link
        href="/admin/pedidos"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft /> Pedidos
      </Link>
      <AdminHeader
        title={order.code}
        description={`Feito em ${formatDateTime(order.created_at)}${order.paid_at ? ` · pago em ${formatDateTime(order.paid_at)}` : ''}`}
        actions={
          <>
            {order.status === 'pending_payment' && (
              <Button variant="outline" onClick={sync} disabled={syncing}>
                {syncing ? <CircleNotch className="animate-spin" /> : <ArrowsClockwise />} Conferir pagamento
              </Button>
            )}
            {next && (
              <Button onClick={() => save(next)} disabled={saving}>
                {saving && <CircleNotch className="animate-spin" />} Marcar como{' '}
                {ORDER_STATUS[next].label.toLowerCase()}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel>
            <div className="mb-5 flex items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-sm text-muted-foreground">
                {order.payment_method === 'pix'
                  ? 'Pix'
                  : `Cartão${order.installments ? ` · ${order.installments}x` : ''}`}
                {order.payment_detail ? ` · ${order.payment_detail}` : ''}
              </span>
            </div>
            <OrderProgress status={order.status} />
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-bold">Itens</h2>
            <OrderItems order={order} />
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="font-display text-lg font-bold">Andamento</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                save()
              }}
              className="mt-4 flex flex-col gap-4"
            >
              <Field label="Status">
                <Select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
                  {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => (
                    <option key={value} value={value}>
                      {ORDER_STATUS[value].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Código de rastreio" hint="O cliente vê o link na página do pedido.">
                <Input
                  value={tracking}
                  onChange={(event) => setTracking(event.target.value.toUpperCase())}
                  placeholder="AA123456789BR"
                />
              </Field>
              <Button type="submit" variant="outline" disabled={saving}>
                Salvar andamento
              </Button>
            </form>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-bold">Cliente</h2>
            <p className="mt-3 text-sm font-semibold">{c.name}</p>
            <p className="text-sm text-muted-foreground">CPF {formatCpf(c.cpf)}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm">
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 hover:underline">
                <EnvelopeSimple /> {c.email}
              </a>
              {c.phone && (
                <a
                  href={`https://wa.me/55${c.phone}?text=${encodeURIComponent(`Oi, ${c.name.split(' ')[0]}! Aqui é da Kaê, sobre o pedido ${order.code}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <WhatsappLogo /> {formatPhone(c.phone)}
                </a>
              )}
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Entrega</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const a = order.shipping_address
                  navigator.clipboard
                    .writeText(
                      `${a.recipient}\n${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}\n${a.district} - ${a.city}/${a.state}\nCEP ${a.cep.replace(/^(\d{5})/, '$1-')}`,
                    )
                    .then(() => toast.success('Endereço copiado.'))
                }}
              >
                <Copy /> Copiar
              </Button>
            </div>
            <div className="mt-3">
              <OrderShipping order={order} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
