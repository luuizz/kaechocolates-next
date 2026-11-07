import { defineConfig, devices } from '@playwright/test'

// Testes de ponta a ponta contra o ambiente simulado de e2e/stack (sem contas externas).
// No CI: a esteira sobe o ambiente, faz o build e roda `yarn test:e2e`. Veja e2e/README.md.
export default defineConfig({
  testDir: 'e2e/tests',
  fullyParallel: false,
  workers: 1, // os testes compartilham o mesmo banco
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3100',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'yarn start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
