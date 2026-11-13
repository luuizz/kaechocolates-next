'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { listSubscriptions, manageSubscription } from '@/lib/admin-api'
import { receivesBox } from '@/lib/club'
import type { Subscription } from '@/types/club'

export type SubscriberFilter = 'caixa' | 'active' | 'paused' | 'canceled' | 'todos'
export type SubscriptionAction = 'pause' | 'resume' | 'cancel'

export function useSubscribers() {
  const [subs, setSubs] = useState<Subscription[] | null>(null)
  const [now, setNow] = useState(0)
  const [filter, setFilter] = useState<SubscriberFilter>('caixa')
  const [search, setSearch] = useState('')

  const load = () =>
    listSubscriptions()
      .then((rows) => {
        setSubs(rows)
        setNow(Date.now())
      })
      .catch((err) => toast.error(err.message))
  useEffect(() => {
    load()
  }, [])

  const matches = (sub: Subscription, value: SubscriberFilter) =>
    value === 'todos' ? sub.status !== 'pending' : value === 'caixa' ? receivesBox(sub, now) : sub.status === value
  const count = (value: SubscriberFilter) => (subs ?? []).filter((sub) => matches(sub, value)).length

  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    const text = (sub: Subscription) => `${sub.customer.name} ${sub.customer.email} ${sub.shipping_address.city}`
    return (subs ?? []).filter((sub) => matches(sub, filter) && (!term || text(sub).toLowerCase().includes(term)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches depende só de now
  }, [subs, filter, search, now])

  const boxes = (subs ?? []).filter((sub) => receivesBox(sub, now))
  const active = (subs ?? []).filter((sub) => sub.status === 'active')
  const stats = subs && {
    active: active.length,
    mrr: active.reduce((total, sub) => total + sub.monthly, 0),
    bars: boxes.reduce((total, sub) => total + sub.plan.bars, 0),
  }

  const act = async (sub: Subscription, action: SubscriptionAction) => {
    const confirmText = `Cancelar a assinatura de ${sub.customer.name}? As próximas cobranças não acontecem.`
    if (action === 'cancel' && !window.confirm(confirmText)) return
    try {
      await manageSubscription(sub.id, action)
      toast.success('Assinatura atualizada.')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    }
  }

  return { loaded: Boolean(subs), list, boxes, stats, filter, setFilter, search, setSearch, count, act }
}
