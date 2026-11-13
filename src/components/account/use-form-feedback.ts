'use client'

import { useState } from 'react'

type Feedback = { tone: 'error' | 'success'; text: string }

export function useFormFeedback() {
  const [message, setMessage] = useState<Feedback | null>(null)
  const [busy, setBusy] = useState(false)

  const fail = (text: string) => setMessage({ tone: 'error', text })

  const run = async (action: () => Promise<void>, success: string, fallback: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setMessage({ tone: 'success', text: success })
    } catch (err) {
      fail(err instanceof Error ? err.message : fallback)
    }
    setBusy(false)
  }

  return { message, busy, fail, clear: () => setMessage(null), run }
}
