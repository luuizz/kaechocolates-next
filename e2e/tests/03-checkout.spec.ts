import { api, emailsTo, expect, fillAddress, mercadoPagoLog, signUp, sql, test, text, uniqueEmail, sqlOne } from './helpers'

test.describe('Checkout', () => {
  test('Pix do início ao fim, com frete e desconto calculados no servidor', async ({ page }) => {
    await page.goto('/produtos/intenso-71')
    await page.getByRole('button', { name: 'Adicionar à sacola' }).click()
    await page.keyboard.press('Escape')
    await page.goto('/kits')
    await page.getByRole('button', { name: 'Adicionar à sacola' }).first().click()
    await page.keyboard.press('Escape')

    // Sem login → cadastro → volta ao checkout
    await page.goto('/checkout')
    await page.waitForURL(/\/entrar/)
    const email = uniqueEmail('bruno')
    await signUp(page, { name: 'Bruno Lima', email, next: '/checkout' })
    await expect(page.getByRole('button', { name: 'Salvar endereço' })).toBeVisible() // sem endereço: abre o formulário
    await fillAddress(page, { cep: '40010000', street: 'Rua Chile', number: '22', city: 'Salvador', state: 'BA' })

    // Intenso 32,70 + kit dos premiados (6 × 32,70 − 8%) = 32,70 + 180,50; frete Nordeste 29,90
    await expect.poll(() => text(page, 'aside')).toContain('R$ 243,10')
    expect(await text(page, 'aside')).toContain('-R$ 15,70')
    await expect(page.getByText('Entrega padrão · Nordeste')).toBeVisible()

    await page.getByRole('button', { name: /com Pix/ }).click()
    await expect(page.getByText(/Informe um CPF válido/)).toBeVisible()
    await page.getByPlaceholder('000.000.000-00').fill('12345678909')
    await page.getByRole('button', { name: /com Pix/ }).click()

    await page.waitForURL(/\/pedido\/KAE-/)
    const code = page.url().split('/').pop()!
    await expect(page.locator('header button[aria-label^="Abrir sacola"]')).toContainText('0')
    // No modo de teste o Pix é aprovado sozinho e a página se atualiza
    await expect(page.getByText('Obrigado pela compra!')).toBeVisible({ timeout: 20_000 })
    expect((await sql<{ status: string; total: string }>('select status, total from public.orders where code = $1', [code]))[0]).toEqual({ status: 'paid', total: '243.10' })

    const sent = (await mercadoPagoLog()).filter((entry) => entry.type === 'order').at(-1)!
    expect(sent.body.total_amount).toBe('243.10')
    expect(sent.body.payer?.first_name).toBe('APRO')

    // E-mails: pedido recebido (com o Pix) e pagamento aprovado, cada um uma vez só
    await expect.poll(async () => (await emailsTo(email)).map((mail) => mail.subject)).toEqual(expect.arrayContaining([`Recebemos seu pedido ${code}`, `Pagamento aprovado · pedido ${code}`]))
    await page.reload()
    await page.waitForTimeout(1500)
    const mails = await emailsTo(email)
    expect(mails.filter((mail) => mail.subject?.startsWith('Pagamento aprovado'))).toHaveLength(1)
    expect(mails.find((mail) => mail.subject?.startsWith('Recebemos'))?.html).toContain('br.gov.bcb.pix')

    await page.goto('/conta?aba=pedidos')
    await expect(page.locator('main')).toContainText(code)
  })

  test('cartão aprovado e recusado, estoque e validações', async ({ page }) => {
    const email = uniqueEmail('carol')
    await signUp(page, { name: 'Carol Reis', email })
    await page.goto('/conta?aba=enderecos')
    await page.getByRole('button', { name: 'Novo endereço' }).click()
    await fillAddress(page)
    await expect(page.locator('main')).toContainText('Praça Marechal Deodoro')
    const { id: addressId } = await sqlOne<{ id: string }>('select a.id from public.addresses a join public.profiles p on p.id = a.user_id where p.email = $1', [email])

    await sql("update public.products set stock = 3 where slug = 'cafezinho-64'")
    const items = [{ kind: 'product', slug: 'cafezinho-64', quantity: 1 }]
    const base = { items, addressId: Number(addressId), cpf: '12345678909' }

    let response = await api(page, '/api/checkout', { ...base, method: 'card', card: { token: 'tok', paymentMethodId: 'master', installments: 3 } })
    expect(response.status).toBe(201)
    expect(response.body.order.status).toBe('paid')

    response = await api(page, '/api/checkout', { ...base, method: 'card', card: { token: 'rejeitar', paymentMethodId: 'master', installments: 1 } })
    expect(response.status).toBe(402)
    expect(response.body.error).toContain('limite')
    // Recusado: o estoque reservado volta
    expect((await sqlOne<{ stock: number }>("select stock from public.products where slug = 'cafezinho-64'")).stock).toBe(2)

    response = await api(page, '/api/checkout', { ...base, items: [{ kind: 'product', slug: 'cafezinho-64', quantity: 5 }], method: 'pix' })
    expect(response.status).toBe(409)
    expect(response.body.error).toContain('Só temos 2')

    response = await api(page, '/api/checkout', { ...base, cpf: '11111111111', method: 'pix' })
    expect(response.status).toBe(400)

    const anonymous = await page.request.post('/api/checkout', { data: { ...base, method: 'pix' } })
    expect(anonymous.status()).toBe(401)

    await sql("update public.products set stock = null where slug = 'cafezinho-64'")
  })
})
