import { action, expect, signUp, test, uniqueEmail } from './helpers'

// Regras de acesso: o banco (RLS), o proxy e as Server Actions barram quem não pode
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

  test('áreas e ações do site exigem login ou admin', async ({ request, page }) => {
    // Sem sessão, o proxy manda para o login antes de a página ou a action rodar
    for (const route of ['/admin', '/conta', '/checkout', '/pedido/KAE-1001', '/clube/assinar']) {
      const response = await request.get(route, { maxRedirects: 0 })
      expect(response.status(), route).toBe(307)
      expect(response.headers()['location'], route).toContain(`/entrar?volta=${encodeURIComponent(route)}`)
    }
    for (const name of ['placeOrder', 'subscribeToClub', 'refreshStore']) {
      expect((await action(request, name, {})).status, name).toBe(307)
    }

    // Cliente logado não executa ações do painel nem abre o painel
    await signUp(page, { name: 'Ana Souza', email: uniqueEmail('seguranca') })
    expect((await action(page.request, 'refreshStore')).result).toMatchObject({ ok: false })
    expect((await action(page.request, 'notifyOrderUpdate', 'KAE-1001')).result).toMatchObject({ ok: false })
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible()
    expect((await page.request.post('/api/images', { data: {} })).status()).toBe(403)

    // Webhook com id que não existe no Mercado Pago: ignora com 200
    const webhook = await request.post('/api/mercadopago/webhook?data.id=123456&type=order', { data: {} })
    expect(webhook.status()).toBe(200)
  })
})
