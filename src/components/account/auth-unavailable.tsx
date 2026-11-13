import { Plugs } from '@phosphor-icons/react'

export function AuthUnavailable() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-secondary p-5 text-sm">
      <Plugs size={22} weight="duotone" className="shrink-0" />
      <p>
        O login ainda não está ligado neste ambiente. Configure <code>NEXT_PUBLIC_NEON_AUTH_URL</code> e{' '}
        <code>NEXT_PUBLIC_NEON_DATA_API_URL</code> (veja o README).
      </p>
    </div>
  )
}
