import {
  emailsTo,
  expect,
  fillAddress,
  mercadoPagoLog,
  signUp,
  test,
  text,
  uniqueEmail,
  sqlOne,
  action,
} from './helpers'

// O formulário de cartão é do Mercado Pago (carrega de fora); aqui a assinatura é
// feita pela rota do site com um token de cartão simulado.
test.describe('Clube', () => {
  test('assinar, ver na conta, regras de pausa e cancelamento', async ({ page }) => {
    await page.goto('/clube')
    await page.getByRole('radio', { name: /Trimestral/ }).click()
    await page.getByRole('link', { name: 'Assinar Chocólatra' }).click()
    await page.waitForURL(/\/entrar\?volta=/)

    const email = uniqueEmail('dani')
    await signUp(page, { name: 'Dani Prado', email, next: '/clube/assinar?plano=chocolatra&periodo=trimestral' })
    await expect.poll(() => text(page, 'aside')).toContain('R$ 104,41')
    expect(await text(page, 'aside')).toContain('R$ 313,23 a cada 3 meses')
    await fillAddress(page)
    await expect(page.getByRole('radio', { name: /Praça Marechal Deodoro/ })).toBeVisible()
    await expect(page.getByText(/se repete a cada 3 meses/)).toBeVisible()

    const { id: addressId } = await sqlOne<{ id: string }>(
      'select a.id from public.addresses a join public.profiles p on p.id = a.user_id where p.email = $1',
      [email],
    )
    const subscribe = (plan: string, period: string, token = 'tok') =>
      action(page.request, 'subscribeToClub', {
        plan,
        period,
        addressId: Number(addressId),
        cpf: '12345678909',
        notes: 'sem castanhas',
        card: { token },
      })

    let { result } = await subscribe('chocolatra', 'trimestral', 'rejeitar')
    expect(result?.ok).toBe(false)

    ;({ result } = await subscribe('chocolatra', 'trimestral'))
    expect(result?.ok).toBe(true)
    expect(result?.data?.status).toBe('active')
    const sent = (await mercadoPagoLog()).filter((entry) => entry.type === 'preapproval').at(-1)!
    expect(sent.body.auto_recurring).toMatchObject({
      frequency: 3,
      frequency_type: 'months',
      transaction_amount: 313.23,
      currency_id: 'BRL',
    })
    expect(sent.body.payer_email).toBe('test_user_e2e@testuser.com')
    await expect
      .poll(async () => (await emailsTo(email)).map((mail) => mail.subject))
      .toContain('Boas-vindas ao Clube Kaê!')

    ;({ result } = await subscribe('familia', 'mensal'))
    expect(result?.ok).toBe(false) // uma assinatura em andamento por cliente

    await page.goto('/conta?aba=clube')
    await expect(page.locator('main')).toContainText('Chocólatra')
    await expect(page.locator('main')).toContainText('Ativa')
    await expect(page.locator('main')).toContainText('final 6351')
    await expect(page.getByRole('button', { name: 'Pausar' })).toHaveCount(0) // trimestral não pausa
    expect((await action(page.request, 'manageSubscription', { action: 'pause' })).result?.ok).toBe(false)

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Cancelar renovação' }).click()
    await expect(page.getByText('Caixas até')).toBeVisible()

    // Mensal: pausar e retomar
    expect((await subscribe('degustacao', 'mensal')).status).toBe(201)
    await page.reload()
    await page.getByRole('button', { name: 'Pausar' }).click()
    await expect(page.getByText('Pausada').first()).toBeVisible()
    await page.getByRole('button', { name: 'Retomar' }).click()
    await expect(page.getByText('Ativa').first()).toBeVisible()
  })
})
