// Variáveis do site durante os testes (todas apontam para o ambiente simulado; nada é secreto)
export const e2eEnv = {
  NEXT_PUBLIC_NEON_AUTH_URL: 'http://localhost:54321/neondb/auth',
  NEXT_PUBLIC_NEON_DATA_API_URL: 'http://localhost:54321/neondb/rest/v1',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3100',
  DATABASE_URL: (() => {
    const url = new URL(process.env.E2E_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres')
    url.pathname = '/kae_e2e'
    return url.toString()
  })(),
  MERCADOPAGO_ACCESS_TOKEN: 'TEST-e2e',
  MERCADOPAGO_API_URL: 'http://127.0.0.1:4300',
  MERCADOPAGO_TEST_MODE: 'true',
  MERCADOPAGO_TEST_PAYER_EMAIL: 'test_user_e2e@testuser.com',
  RESEND_API_KEY: 're_e2e',
  RESEND_API_URL: 'http://127.0.0.1:4300',
}
