'use client'

import { productFromRow } from '@/lib/catalog-rows'
import { getAccessToken, getNeon, unwrap } from '@/lib/neon'
import type { Product } from '@/data/products'
import type { Box } from '@/data/kits'
import type { Period, Plan } from '@/data/club'
import { normalizeOrder, type OrderStatus } from '@/lib/orders'
import { normalizeSubscription, type Subscription } from '@/lib/club'

// Acesso do painel ao banco. Todas as chamadas vão com o token do admin;
// quem barra quem não é admin são as políticas (RLS) do banco.

// soldOut = marcada como esgotada OU estoque zerado; soldOutFlag = só a marcação manual
export type AdminProduct = Product & { id: number; active: boolean; sortOrder: number; updatedAt: string; soldOutFlag: boolean }
export type AdminBox = Box & { active: boolean; sort_order: number }
export type AdminPlan = Plan & { active: boolean; sort_order: number }
export type AdminPeriod = Period & { active: boolean; sort_order: number }
export type Customer = { id: string; email: string | null; full_name: string | null; phone: string | null; role: 'customer' | 'admin'; created_at: string }

const neon = () => getNeon()

// ---- produtos -------------------------------------------------------------

type Row = Parameters<typeof productFromRow>[0] & { active: boolean; sort_order: number; updated_at: string }
const adminProduct = (row: Row): AdminProduct => ({ ...productFromRow(row), id: row.id, active: row.active, sortOrder: row.sort_order, updatedAt: row.updated_at, soldOutFlag: row.sold_out })

export async function listProducts() {
  const rows = unwrap(await neon().from('products').select('*').order('sort_order').order('id')) as Row[]
  return rows.map(adminProduct)
}

export async function getProduct(id: number) {
  const rows = unwrap(await neon().from('products').select('*').eq('id', id).limit(1)) as Row[]
  return rows[0] ? adminProduct(rows[0]) : null
}

export type ProductInput = Omit<AdminProduct, 'id' | 'updatedAt' | 'soldOutFlag'> & { id?: number }

const toRow = (product: ProductInput) => ({
  slug: product.slug,
  name: product.name,
  cacao: product.cacao,
  line: product.line,
  label_color: product.label,
  tile_color: product.tile,
  label_text: product.labelText ?? 'dark',
  price: product.price,
  compare_at_price: product.compareAt ?? null,
  weight: product.weight,
  short: product.short,
  description: product.description || null,
  ingredients: product.ingredients || null,
  badge: product.badge ?? null,
  sold_out: Boolean(product.soldOut),
  image: product.image || null,
  sort_order: product.sortOrder,
  stock: product.stock ?? null,
  active: product.active,
})

export async function saveProduct(product: ProductInput) {
  const query = product.id
    ? neon().from('products').update(toRow(product)).eq('id', product.id).select()
    : neon().from('products').insert(toRow(product)).select()
  const rows = unwrap(await query) as Row[]
  if (!rows[0]) throw new Error('Você não tem permissão para salvar produtos.')
  return adminProduct(rows[0])
}

export async function updateProductFields(id: number, fields: Partial<Pick<Row, 'active' | 'sold_out' | 'sort_order'>>) {
  unwrap(await neon().from('products').update(fields).eq('id', id))
}

export async function deleteProduct(id: number) {
  unwrap(await neon().from('products').delete().eq('id', id))
}

// ---- caixas e clube ------------------------------------------------------

const numeric = <T extends { discount?: number | string; price?: number | string }>(row: T) => ({
  ...row,
  ...(row.discount !== undefined && { discount: Number(row.discount) }),
  ...(row.price !== undefined && { price: Number(row.price) }),
})

export async function listBoxes() {
  return (unwrap(await neon().from('kit_boxes').select('*').order('sort_order')) as AdminBox[]).map(numeric) as AdminBox[]
}
export async function listPlans() {
  return (unwrap(await neon().from('club_plans').select('*').order('sort_order')) as AdminPlan[]).map(numeric) as AdminPlan[]
}
export async function listPeriods() {
  return (unwrap(await neon().from('club_periods').select('*').order('sort_order')) as AdminPeriod[]).map(numeric) as AdminPeriod[]
}

type Table = 'kit_boxes' | 'club_plans' | 'club_periods' | 'shipping_zones'

// Grava a lista inteira: atualiza/insere as linhas e apaga as que saíram
export async function saveRows<T extends { id: string }>(table: Table, rows: T[], removed: string[]) {
  if (removed.length) unwrap(await neon().from(table).delete().in('id', removed))
  if (rows.length) unwrap(await neon().from(table).upsert(rows, { onConflict: 'id' }))
}

// ---- clientes ------------------------------------------------------------

export async function listCustomers() {
  return unwrap(await neon().from('profiles').select('id,email,full_name,phone,role,created_at').order('created_at', { ascending: false })) as Customer[]
}

// ---- rotas do site (fotos e cache da loja) -------------------------------

async function callSite(path: string, init: RequestInit) {
  const token = await getAccessToken()
  if (!token) throw new Error('Sessão expirada. Entre de novo.')
  const response = await fetch(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Erro ${response.status}`)
  return body
}

export async function uploadImage(file: File) {
  const { url } = await callSite('/api/images', { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
  return url as string
}

// Fotos que vieram com o site (/images/...) não são apagadas
export async function deleteImage(url: string) {
  if (!url.startsWith('https://')) return
  await callSite('/api/images', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).catch(() => {})
}

// Avisa a loja para recarregar o catálogo (sem esperar o cache de 5 minutos)
export async function refreshStore() {
  await callSite('/api/revalidate', { method: 'POST' })
}

// ---- pedidos e frete -----------------------------------------------------

export type AdminOrderRow = {
  id: number; code: string; status: OrderStatus; total: number; created_at: string
  payment_method: 'pix' | 'card'; customer: { name: string; email: string }; shipping_address: { city: string; state: string }
  order_items: { quantity: number }[]
}

export async function listOrders() {
  const rows = unwrap(await neon().from('orders').select('id,code,status,total,created_at,payment_method,customer,shipping_address,order_items(quantity)').order('created_at', { ascending: false }).limit(300)) as AdminOrderRow[]
  return rows.map((row) => ({ ...row, total: Number(row.total) }))
}

export async function getOrder(code: string) {
  const rows = unwrap(await neon().from('orders').select('*, order_items(kind,product_id,name,quantity,unit_price,total,kit)').eq('code', code).limit(1)) as (Record<string, unknown> & { order_items: Record<string, unknown>[] })[]
  if (!rows[0]) return null
  const { order_items: items, ...order } = rows[0]
  return normalizeOrder(order, items)
}

export async function updateOrder(id: number, status: string, tracking: string) {
  unwrap(await neon().rpc('admin_update_order', { p_id: id, p_status: status, p_tracking: tracking }))
}

// Manda os 4 e-mails automáticos de exemplo para o admin logado
export async function sendTestEmails() {
  return (await callSite('/api/admin/emails/test', { method: 'POST' })) as { to: string }
}

// Avisa o cliente por e-mail do novo andamento (ex.: enviado com rastreio)
export async function notifyOrderChange(code: string) {
  await callSite(`/api/admin/orders/${encodeURIComponent(code)}/notify`, { method: 'POST' })
}

export type AdminZone = { id: string; name: string; states: string[]; price: number; days_min: number; days_max: number; active: boolean; sort_order: number }
export async function listZones() {
  return (unwrap(await neon().from('shipping_zones').select('*').order('sort_order')) as AdminZone[]).map((zone) => ({ ...zone, price: Number(zone.price) }))
}

// ---- clube: assinantes ----------------------------------------------------

export async function listSubscriptions() {
  const rows = unwrap(await neon().from('subscriptions').select('*').order('created_at', { ascending: false }).limit(1000)) as Subscription[]
  return rows.map(normalizeSubscription)
}

export async function manageSubscription(id: number, action: 'pause' | 'resume' | 'cancel') {
  await callSite('/api/club/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
}
