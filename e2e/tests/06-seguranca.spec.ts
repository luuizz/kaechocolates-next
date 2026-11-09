import { expect, test } from './helpers'

// Regras de acesso: o banco (RLS) e as rotas do site barram quem não pode
test.describe('Segurança', () => {
  test('visitante só lê o catálogo', async ({ request }) => {
    const { token } = await (await request.get('http://localhost:54321/neondb/auth/token/anonymous')).json()
    const headers = { Authorization: `Bearer ${token}` }
    const rest = 'http://localhost:54321/neondb/rest/v1'

    expect((await request.get(`${rest}/products?select=slug&limit=1`, { headers })).status()).toBe(200)
    expect([401, 403]).toContain(
      (await request.patch(`${rest}/products?slug=eq.intenso-71`, { headers, data: { price: 1 } })).status(),
    )
    for (const table of ['orders', 'profiles', 'addresses', 'subscriptions']) {
      expect([401, 403], table).toContain((await request.get(`${rest}/${table}`, { headers })).status())
    }
    // Funções de dinheiro não são chamáveis pela Data API
    expect((await request.post(`${rest}/rpc/place_order`, { headers, data: {} })).ok()).toBe(false)
  })

  test('rotas do site exigem login ou admin', async ({ request }) => {
    expect((await request.post('/api/revalidate')).status()).toBe(403)
    expect((await request.post('/api/checkout', { data: {} })).status()).toBe(401)
    expect((await request.post('/api/club/subscribe', { data: {} })).status()).toBe(401)
    expect((await request.get('/api/orders/KAE-1001')).status()).toBe(401)
    // Webhook com id que não existe no Mercado Pago: ignora com 200
    const webhook = await request.post('/api/mercadopago/webhook?data.id=123456&type=order', { data: {} })
    expect(webhook.status()).toBe(200)
  })
})
