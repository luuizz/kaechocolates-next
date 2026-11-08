// Roda os testes de ponta a ponta do zero: sobe o ambiente simulado, faz o build com as
// variáveis de teste e roda o Playwright.  yarn e2e  (precisa de um Postgres; veja e2e/README.md)
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { e2eEnv } from './env.mjs'

const env = { ...process.env, ...e2eEnv }
const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit', env })
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} falhou (${code})`))))
})

const stack = spawn('node', ['e2e/stack/up.mjs'], { stdio: 'inherit', env })
const stop = () => stack.kill()
process.on('exit', stop)

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch('http://localhost:54321/health')).ok) break } catch { /* subindo */ }
    if (i > 120) throw new Error('O ambiente simulado não subiu.')
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  // O cache do catálogo sobrevive entre builds; o banco de teste é novo a cada execução
  rmSync('.next/cache/fetch-cache', { recursive: true, force: true })
  if (!process.argv.includes('--sem-build')) await run('yarn', ['build'])
  await run('yarn', ['playwright', 'test', ...process.argv.slice(2).filter((arg) => arg !== '--sem-build')])
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  stop()
}
