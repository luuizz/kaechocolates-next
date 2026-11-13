'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/components/cart/cart-provider'
import { useCatalog } from '@/components/catalog/catalog-provider'

export function useKitBuilder() {
  const { addKit } = useCart()
  const { products, boxes, findBox, kitTotals } = useCatalog()
  const available = useMemo(() => products.filter((product) => !product.soldOut), [products])
  const [boxId, setBoxId] = useState(() => (boxes.find((item) => item.id === 'm') ?? boxes[0])?.id ?? '')
  const [picked, setPicked] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [added, setAdded] = useState(false)

  const box = findBox(boxId) ?? { id: '', name: 'Caixa', size: 0, discount: 0 }
  const full = box.size > 0 && picked.length === box.size
  const totals = useMemo(() => kitTotals({ box: boxId, slugs: picked }), [boxId, picked, kitTotals])
  const countOf = (slug: string) => picked.filter((item) => item === slug).length

  const changeBox = (id: string) => {
    setBoxId(id)
    setPicked((current) => current.slice(0, findBox(id)?.size ?? 0))
  }
  const plus = (slug: string) => {
    if (!full) {
      setPicked((current) => [...current, slug])
      setAdded(false)
    }
  }
  const minus = (slug: string) => {
    setPicked((current) => {
      const index = current.lastIndexOf(slug)
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)]
    })
    setAdded(false)
  }
  const surprise = () => {
    const missing = box.size - picked.length
    const extra = Array.from({ length: missing }).flatMap(
      () => available[Math.floor(Math.random() * available.length)]?.slug ?? [],
    )
    setPicked((current) => [...current, ...extra])
  }
  const submit = () => {
    addKit({
      name: `Kit ${box.name.replace('Caixa ', '')} montado por você`,
      box: boxId,
      slugs: picked,
      message: message.trim() || undefined,
    })
    setAdded(true)
    setPicked([])
    setMessage('')
  }

  return {
    boxes,
    available,
    boxId,
    box,
    picked,
    full,
    totals,
    message,
    setMessage,
    added,
    countOf,
    changeBox,
    plus,
    minus,
    surprise,
    clear: () => setPicked([]),
    submit,
  }
}
