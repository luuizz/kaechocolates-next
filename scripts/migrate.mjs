import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'database', 'migrations')
const args = new Set(process.argv.slice(2))

function readEnvFile(file) {
  if (!existsSync(file)) return {}
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]),
  )
}

const url = process.env.DATABASE_URL || readEnvFile(join(root, '.env.local')).DATABASE_URL
if (!url) {
  console.error('DATABASE_URL não definida. Coloque a connection string do Neon no .env.local ou no ambiente.')
  process.exit(1)
}

const files = readdirSync(dir)
  .filter((name) => /^\d{4}_.+\.sql$/.test(name))
  .sort()
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url)
const client = new pg.Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: true } })

await client.connect()
try {
  // Fora do schema public, para não aparecer na Data API
  await client.query(`
        create schema if not exists app_migrations;
        create table if not exists app_migrations.applied (
            version    text primary key,
            applied_at timestamptz not null default now()
        );
    `)
  // Evita duas execuções ao mesmo tempo (ex.: dois deploys seguidos)
  await client.query('select pg_advisory_lock(hashtext($1))', ['kae-migrations'])

  const { rows } = await client.query('select version from app_migrations.applied')
  const done = new Set(rows.map((row) => row.version))
  const pending = files.filter((name) => !done.has(name))

  if (pending.length === 0) {
    console.log(`Banco em dia (${files.length} migrations aplicadas).`)
  } else if (args.has('--status')) {
    console.log(`Pendentes (${pending.length}):\n${pending.map((name) => `  - ${name}`).join('\n')}`)
  } else if (args.has('--baseline')) {
    for (const name of pending) await client.query('insert into app_migrations.applied (version) values ($1)', [name])
    console.log(`Marcadas como aplicadas sem rodar: ${pending.join(', ')}`)
  } else {
    for (const name of pending) {
      const sql = readFileSync(join(dir, name), 'utf8')
      process.stdout.write(`Aplicando ${name}... `)
      try {
        await client.query('begin')
        await client.query(sql)
        await client.query('insert into app_migrations.applied (version) values ($1)', [name])
        await client.query('commit')
        console.log('ok')
      } catch (error) {
        await client.query('rollback')
        console.log('ERRO')
        throw new Error(`${name}: ${error.message}`)
      }
    }
    console.log(`${pending.length} migration(s) aplicada(s).`)
    await client.query("notify pgrst, 'reload schema'").catch(() => {})
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
