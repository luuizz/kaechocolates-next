import { expect, test, text } from './helpers'

test.describe('Loja', () => {
  test('catálogo, filtro, busca e ordenação', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page.locator('main article')).toHaveCount(14)

    await page
      .locator('main')
      .getByRole('link', { name: /Brancos/ })
      .first()
      .click()
    await expect(page).toHaveURL(/linha=brancos/)
    await expect(page.locator('main article')).toHaveCount(3)

    await page.goto('/produtos?ordem=mais-cacau')
    await expect(page.locator('main article h3').first()).toContainText('71')

    await page.goto('/')
    await page.locator('header input[type=search]').fill('café')
    await page.locator('header input[type=search]').press('Enter')
    await expect(page).toHaveURL(/busca=/)
    await expect(page.locator('main article')).toHaveCount(2)
  })

  test('sacola: adicionar, quantidade e persistência', async ({ page }) => {
    await page.goto('/produtos/cupuacu-64')
    await page.getByRole('button', { name: 'Aumentar' }).first().click()
    await page.getByRole('button', { name: 'Adicionar à sacola' }).click()
    await expect(page.getByRole('dialog')).toContainText('Sua sacola')
    await page.keyboard.press('Escape')
    await expect(page.locator('header button[aria-label^="Abrir sacola"]')).toContainText('2')

    await page.goto('/carrinho')
    await expect(page.locator('main')).toContainText('Cupuaçu 64%')
    await page.locator('[aria-label^="Quantidade de Cupuaçu"]').getByRole('button', { name: 'Aumentar' }).click()
    expect(await text(page, 'aside')).toContain('R$ 98,10')
  })

  test('kits: premiados e monte seu kit com desconto', async ({ page }) => {
    await page.goto('/kits')
    await page.getByRole('button', { name: 'Adicionar à sacola' }).first().click()
    await expect(page.getByRole('dialog')).toContainText('Kit dos premiados')
    await page.keyboard.press('Escape')

    await page.getByRole('radio', { name: /Caixa P/ }).click()
    for (const name of ['Cupuaçu', 'Cupuaçu', 'Caipira'])
      await page.getByRole('button', { name: `Colocar ${name}` }).click()
    await expect(page.getByRole('button', { name: 'Colocar Intenso' })).toBeDisabled()
    await page.locator('#kit-message').fill('Feliz aniversário!')
    await page.getByRole('button', { name: 'Adicionar kit à sacola' }).click()
    const drawer = await text(page, '[role=dialog]')
    expect(drawer).toContain('Feliz aniversário!')
    expect(drawer).toContain('93,19')
  })

  test('celular sem rolagem lateral', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
    const page = await context.newPage()
    for (const path of ['/', '/produtos', '/produtos/guru-60', '/kits', '/clube', '/carrinho', '/entrar']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
    await context.close()
  })

  test('SEO: sitemap, dados estruturados e imagem de compartilhamento', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/produtos/cupuacu-64')

    await page.goto('/produtos/cupuacu-64')
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(JSON.parse(ld!)[0]).toMatchObject({ '@type': 'Product', offers: { priceCurrency: 'BRL' } })
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/produtos\/cupuacu-64$/)

    const ogUrl = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(ogUrl).toContain('/produtos/cupuacu-64/opengraph-image')
    const og = await request.get(new URL(ogUrl!).pathname)
    expect(og.headers()['content-type']).toContain('image/png')
  })
})
