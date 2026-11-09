import { defineConfig, globalIgnores } from 'eslint/config'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
  ...coreWebVitals,
  ...typescript,
  // Por último: desliga regras de estilo que brigam com o Prettier
  prettier,
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**']),
])
