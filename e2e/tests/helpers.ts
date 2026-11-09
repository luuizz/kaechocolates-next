import { test as base, expect, type Page } from '@playwright/test'
import pg from 'pg'
import { e2eEnv } from '../env.mjs'

// Página com o ViaCEP bloqueado: o endereço é preenchido à mão e o teste não depende de rede
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route(/viacep\.com\.br/, (route) => route.abort())
    await provide(page)
  },
})
export { expect }

const pool = new pg.Pool({ connectionString: e2eEnv.DATABASE_URL, allowExitOnIdle: true })
export async function sql<T = Record<string, unknown>>(query: string, params: unknown[] = []) {
  return (await pool.query(query, params)).rows as T[]
}

// Primeira linha da consulta; falha o teste se não vier nenhuma
export async function sqlOne<T = Record<string, unknown>>(query: string, params: unknown[] = []) {
  const [row] = await sql<T>(query, params)
  if (!row) throw new Error(`Consulta sem resultado: ${query}`)
  return row
}

export const uniqueEmail = (name: string) => `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@kae.test`

// Texto com espaço comum no lugar do espaço fixo do Intl (R$ 32,70)
export const text = async (page: Page, selector = 'main') =>
  (await page.locator(selector).first().innerText()).replace(/ /g, ' ')

export async function signUp(
  page: Page,
  { name, email, password = 'segredo123', next }: { name: string; email: string; password?: string; next?: string },
) {
  await page.goto(`/cadastro${next ? `?volta=${encodeURIComponent(next)}` : ''}`)
  await page.getByLabel('Nome').fill(name)
  await page.getByLabel('E-mail').fill(email)
  await page.locator('input[autocomplete="new-password"]').fill(password)
  await page.locator('main').getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL(next ? (url) => url.pathname === next.split('?')[0] : /\/conta/)
}

export async function makeAdmin(email: string) {
  await sql("update public.profiles set role = 'admin' where email = $1", [email])
}

export async function fillAddress(
  page: Page,
  {
    cep = '37014230',
    street = 'Praça Marechal Deodoro',
    number = '130',
    district = 'Centro',
    city = 'Varginha',
    state = 'MG',
  } = {},
) {
  await page.locator('input[autocomplete="postal-code"]').fill(cep)
  await page.locator('input[autocomplete="address-line1"]').fill(street)
  await page.getByLabel('Número').fill(number)
  await page.getByLabel('Bairro').fill(district)
  await page.locator('input[autocomplete="address-level2"]').fill(city)
  await page.getByLabel('UF').selectOption(state)
  await page.getByRole('button', { name: 'Salvar endereço' }).click()
}

// Chama uma rota do site com o token do usuário logado nesta página
export async function api(page: Page, path: string, body?: unknown) {
  return page.evaluate(
    async ({ path, body }) => {
      const auth = await fetch('/api/auth/token')
      const { token } = await auth.json()
      const response = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      return { status: response.status, body: await response.json().catch(() => ({})) }
    },
    { path, body },
  )
}

// O que o site mandou para o Mercado Pago simulado
type MercadoPagoRequest = {
  type: 'order' | 'preapproval' | 'email'
  body: {
    total_amount?: string
    payer?: { first_name?: string }
    payer_email?: string
    auto_recurring?: Record<string, unknown>
    to?: string[]
    subject?: string
    html?: string
  }
}

export async function mercadoPagoLog() {
  return (await (await fetch('http://127.0.0.1:4300/__log')).json()) as MercadoPagoRequest[]
}

// E-mails que o site mandou (Resend simulado)
export async function emailsTo(address: string) {
  return (await mercadoPagoLog())
    .filter((entry) => entry.type === 'email' && entry.body.to?.includes(address))
    .map((entry) => entry.body)
}
