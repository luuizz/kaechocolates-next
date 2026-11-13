import { expect, fillAddress, signUp, sql, test, uniqueEmail, sqlOne } from './helpers'

test.describe('Conta', () => {
  test('cadastro, endereço, dados, sair e entrar', async ({ page }) => {
    await page.goto('/cadastro')
    await page.locator('main').getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByText('Conta pra gente seu nome.')).toBeVisible()

    const email = uniqueEmail('ana')
    await signUp(page, { name: 'Ana Souza', email })
    await expect(page.getByText('Oi, Ana!')).toBeVisible()
    await expect(page.locator('header.sticky')).toContainText('Olá, Ana')
    expect(await sql('select 1 from public.profiles where email = $1', [email])).toHaveLength(1)

    await page.goto('/conta?aba=enderecos')
    await page.getByRole('button', { name: 'Novo endereço' }).click()
    await page.getByRole('button', { name: 'Salvar endereço' }).click()
    await expect(page.getByText('CEP com 8 números.')).toBeVisible()
    await fillAddress(page)
    await expect(page.locator('main')).toContainText('Praça Marechal Deodoro, 130')
    await expect(page.getByText('Padrão')).toBeVisible()

    await page.goto('/conta?aba=dados')
    await page.locator('input[autocomplete="tel-national"]').fill('35984773733')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Dados salvos.')).toBeVisible()
    expect((await sqlOne<{ phone: string }>('select phone from public.profiles where email = $1', [email])).phone).toBe(
      '35984773733',
    )

    await page.goto('/admin')
    await expect(page.getByText('Acesso restrito')).toBeVisible()

    await page.goto('/conta')
    await page.getByRole('button', { name: 'Sair' }).click()
    await page.waitForURL('/')
    await expect(page.locator('header.sticky')).toContainText('Entrar')
    await page.goto('/conta')
    await page.waitForURL(/\/entrar/)

    await page.getByLabel('E-mail').fill(email)
    await page.locator('input[autocomplete="current-password"]').fill('errada123')
    await page.locator('main form button[type=submit]').click()
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
    await page.locator('input[autocomplete="current-password"]').fill('segredo123')
    await page.locator('main form button[type=submit]').click()
    await page.waitForURL(/\/conta/)
    await expect(page.getByText('Oi, Ana!')).toBeVisible()
  })
})
