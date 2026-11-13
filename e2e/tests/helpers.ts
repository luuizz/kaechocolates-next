import { readFileSync } from 'node:fs'
import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'
import pg from 'pg'
import { e2eEnv } from '../env.mjs'

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

export async function sqlOne<T = Record<string, unknown>>(query: string, params: unknown[] = []) {
  const [row] = await sql<T>(query, params)
  if (!row) throw new Error(`Consulta sem resultado: ${query}`)
  return row
}

export const uniqueEmail = (name: string) => `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@kae.test`

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

// Chama a action como o navegador: POST na página registrada, cabeçalho Next-Action, cookies de `request`
type ActionEntry = { workers: Record<string, unknown>; exportedName: string }
type ActionCall<T> = { status: number; location: string | null; result: T | null }

function findAction(name: string) {
  const manifest = JSON.parse(readFileSync('.next/server/server-reference-manifest.json', 'utf8')).node as Record<
    string,
    ActionEntry
  >
  const found = Object.entries(manifest).find(([, entry]) => entry.exportedName === name)
  if (!found) throw new Error(`Server Action não encontrada: ${name}`)
  const [id, entry] = found
  const route = Object.keys(entry.workers)
    .map(
      (worker) =>
        worker
          .replace(/^app/, '')
          .replace(/\/\([^)]+\)/g, '')
          .replace(/\/page$/, '') || '/',
    )
    .find((path) => !path.includes('['))
  return { id, route: route ?? '/' }
}

// Linhas "id:json" do RSC; a linha 0 aponta ("$@n") para o retorno da action
function decodeActionResponse(body: string) {
  const rows = new Map(
    body
      .split('\n')
      .filter(Boolean)
      .map((line) => [line.slice(0, line.indexOf(':')), line.slice(line.indexOf(':') + 1)]),
  )
  const root = JSON.parse(rows.get('0') ?? 'null') as { a?: string } | null
  const ref = root?.a?.replace('$@', '')
  return ref && rows.has(ref) ? JSON.parse(rows.get(ref)!) : null
}

export type ActionOutcome = {
  ok: boolean
  error?: string
  data?: { code?: string; status?: string; order?: { code: string; status: string } | null }
}

export async function action<T = ActionOutcome>(
  request: APIRequestContext,
  name: string,
  ...args: unknown[]
): Promise<ActionCall<T>> {
  const { id, route } = findAction(name)
  const response = await request.post(route, {
    headers: { 'Next-Action': id, 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'text/x-component' },
    data: JSON.stringify(args),
    maxRedirects: 0,
  })
  const ok = response.status() === 200
  return {
    status: response.status(),
    location: response.headers()['location'] ?? null,
    result: ok ? (decodeActionResponse(await response.text()) as T) : null,
  }
}

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

export async function emailsTo(address: string) {
  return (await mercadoPagoLog())
    .filter((entry) => entry.type === 'email' && entry.body.to?.includes(address))
    .map((entry) => entry.body)
}
