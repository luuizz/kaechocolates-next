'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { friendlyError, getNeon, isNeonConfigured, unwrap } from '@/lib/neon'
import type { Profile } from '@/types/account'

type Session = { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }

type AuthValue = {
  configured: boolean
  loading: boolean
  user: Session['user'] | null
  profile: Profile | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string }) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthValue | null>(null)
const redirectTo = (path: string) => `${window.location.origin}${path}`

async function ensureProfile() {
  return unwrap(await getNeon().rpc('ensure_profile')) as Profile
}

// Depois do login a biblioteca guarda a sessão da resposta, com o token interno do
// Better Auth (não o JWT que a Data API aceita). Buscar a sessão de novo, sem cache,
// troca esse token pelo JWT. Sem isso, a primeira consulta falha até recarregar.
async function refreshSessionJwt() {
  const auth = getNeon().auth
  try {
    await auth.getBetterAuthInstance().getSession({ fetchOptions: { headers: { 'X-Force-Fetch': 'true' } } })
  } catch {
    // Segue com a sessão atual; o próximo carregamento busca de novo
  }
  const { data } = await auth.getSession()
  return data.session as Session | null
}

// Métodos do Better Auth (motor do Neon Auth) que não existem na API estilo Supabase
async function callBetterAuth(method: 'resetPassword' | 'changePassword', args: Record<string, unknown>, messages: Record<string, string>) {
  let result: { error?: { code?: string; error?: { code?: string } } | null } | undefined
  try {
    const instance = getNeon().auth.getBetterAuthInstance() as unknown as Record<string, (input: unknown) => Promise<typeof result>>
    result = await instance[method](args)
  } catch (error) {
    result = { error: error as { code?: string } }
  }
  if (result?.error) {
    const raw = result.error.error?.code || result.error.code || ''
    throw new Error(messages[raw] || friendlyError(result.error))
  }
}

// Login com o Neon Auth. A sessão fica no navegador; o perfil (com o papel de
// admin) vem do banco pela função ensure_profile, chamada a cada login.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isNeonConfigured)
  const user = session?.user ?? null

  useEffect(() => {
    if (!isNeonConfigured) return
    let active = true
    const auth = getNeon().auth
    auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (!active) return
      setSession(data.session as Session | null)
      if (!data.session) setLoading(false)
    }).catch(() => active && setLoading(false))

    // Mantém abas sincronizadas (login/logout em outra aba)
    const { data: listener } = auth.onAuthStateChange((_event: string, next: unknown) => {
      if (!active) return
      setSession(next as Session | null)
      if (!next) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega o perfil quando o usuário muda
    setLoading(true)
    ensureProfile()
      .catch(async () => {
        await refreshSessionJwt()
        return ensureProfile()
      })
      .then((data) => active && setProfile(data))
      .catch(() => active && setProfile(null))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [userId])

  const value = useMemo<AuthValue>(() => ({
    configured: isNeonConfigured,
    loading,
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    setProfile,

    signIn: async (email, password) => {
      const data = unwrap(await getNeon().auth.signInWithPassword({ email, password })) as { session: unknown }
      setSession((await refreshSessionJwt()) || (data.session as Session | null))
    },

    signUp: async ({ name, email, password }) => {
      const result = await getNeon().auth.signUp({
        email,
        password,
        options: { data: { displayName: name }, emailRedirectTo: redirectTo('/entrar') },
      })
      if ((result.error as { code?: string } | null)?.code === 'session_not_found') return { needsConfirmation: true }
      const data = unwrap(result) as { session: unknown }
      setSession((await refreshSessionJwt()) || (data.session as Session | null))
      return { needsConfirmation: false }
    },

    signOut: async () => {
      await getNeon().auth.signOut()
      setSession(null)
      setProfile(null)
    },

    requestPasswordReset: async (email) => {
      unwrap(await getNeon().auth.resetPasswordForEmail(email, { redirectTo: redirectTo('/redefinir-senha') }))
    },

    resetPassword: (token, newPassword) => callBetterAuth('resetPassword', { token, newPassword }, {
      INVALID_TOKEN: 'O link expirou ou já foi usado. Peça um novo.',
      bad_jwt: 'O link expirou ou já foi usado. Peça um novo.',
    }),

    changePassword: (currentPassword, newPassword) => callBetterAuth('changePassword', { currentPassword, newPassword, revokeOtherSessions: false }, {
      INVALID_PASSWORD: 'Senha atual incorreta.',
      invalid_credentials: 'Senha atual incorreta.',
    }),
  }), [loading, user, profile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa do AuthProvider')
  return context
}
