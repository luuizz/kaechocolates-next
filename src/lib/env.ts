// Endereços do projeto no Neon (Console → Auth e Console → Data API).
// São públicos (vão para o navegador): ficam na Vercel como variáveis comuns.
const trim = (value?: string) => (value ?? '').trim().replace(/\/$/, '')

export const neonEnv = () => ({
  authUrl: trim(process.env.NEXT_PUBLIC_NEON_AUTH_URL),
  dataApiUrl: trim(process.env.NEXT_PUBLIC_NEON_DATA_API_URL),
})
