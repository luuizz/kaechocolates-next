import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { startAuth } from './auth.mjs'
import { startProxy } from './proxy.mjs'
import { startMercadoPago } from './mercadopago.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const adminUrl = new URL(process.env.E2E_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres')
const dbName = 'kae_e2e'
const dbUrl = new URL(adminUrl)
dbUrl.pathname = `/${dbName}`
const children = []

const log = (message) => console.log(`[e2e] ${message}`)

async function resetDatabase() {
  const admin = new pg.Client({ connectionString: adminUrl.toString() })
  await admin.connect()
  await admin.query(`drop database if exists ${dbName} with (force)`)
  await admin.query(`create database ${dbName}`)
  await admin.end()

  const db = new pg.Client({ connectionString: dbUrl.toString() })
  await db.connect()
  await db.query(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'anonymous') then create role anonymous nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'e2e_authenticator') then create role e2e_authenticator login noinherit password 'e2e'; end if;
    end $$;
    grant anonymous, authenticated to e2e_authenticator;
    grant connect on database ${dbName} to e2e_authenticator;
    create schema auth;
    create function auth.user_id() returns text language sql stable
      as $$ select nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub' $$;
    grant usage on schema auth to anonymous, authenticated;
    create schema neon_auth;
    grant usage on schema public to authenticated, anonymous;
    alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
    alter default privileges in schema public grant usage, select on sequences to authenticated;
  `)
  await db.end()
}

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} saiu com ${code}`)),
    )
  })
}

async function waitFor(url, label, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      if ((await fetch(url)).status < 500) return
    } catch {
      /* ainda subindo */
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`${label} não respondeu em ${url}`)
}

async function main() {
  log(`banco ${dbName} em ${adminUrl.host}`)
  await resetDatabase()

  const auth = await startAuth(dbUrl.toString())
  log('auth :4000 ok')

  await run('node', ['scripts/migrate.mjs'], { DATABASE_URL: dbUrl.toString() })

  const jwks = await auth.jwks()
  const pgrstUrl = new URL(dbUrl)
  pgrstUrl.username = 'e2e_authenticator'
  pgrstUrl.password = 'e2e'
  const dir = mkdtempSync(join(tmpdir(), 'kae-e2e-'))
  const conf = join(dir, 'postgrest.conf')
  writeFileSync(
    conf,
    [
      `db-uri = "${pgrstUrl}"`,
      'db-schemas = "public"',
      'db-anon-role = "anonymous"',
      `jwt-secret = ${JSON.stringify(JSON.stringify(jwks))}`,
      'server-host = "127.0.0.1"',
      'server-port = 3001',
      'db-channel-enabled = true',
    ].join('\n'),
  )
  const postgrest = spawn(process.env.POSTGREST_BIN ?? 'postgrest', [conf], { stdio: 'inherit' })
  children.push(postgrest)
  await waitFor('http://127.0.0.1:3001/', 'PostgREST')
  log('PostgREST :3001 ok')

  startMercadoPago()
  log('Mercado Pago simulado :4300 ok')
  startProxy()
  log('pronto em http://localhost:54321 (health: /health)')
}

const stop = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
main().catch((error) => {
  console.error(error)
  stop()
})
