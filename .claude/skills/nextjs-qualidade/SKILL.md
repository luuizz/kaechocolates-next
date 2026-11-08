---
name: "nextjs-qualidade"
description: "Use ao configurar ou revisar ESLint, Prettier, TypeScript, scripts e padrões de código em projetos Next.js, ou ao corrigir erros de lint e formatação."
---

# Qualidade de código em projetos Next.js

Antes de instalar qualquer pacote, confira as versões já usadas no `package.json` e o gerenciador do projeto (yarn, npm, pnpm), e fixe versões exatas.

## ESLint (flat config)

No Next 16 o comando `next lint` não existe mais: use o ESLint direto (`eslint .`) com `eslint.config.mjs`.

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // por último: desliga regras de estilo que brigam com o Prettier
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**']),
])
```

Regras de convivência:
- `eslint-disable` só na linha, com o motivo: `// eslint-disable-next-line regra -- motivo`.
- Avisos de `react-hooks` são bugs em potencial: corrija em vez de desligar. Exemplo: estado derivado de prop se calcula no render, não em `useEffect`.

## Prettier

`.prettierrc.json`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- `prettier-plugin-tailwindcss` ordena as classes do Tailwind. Com Tailwind 4, aponte o CSS principal: `"tailwindStylesheet": "./src/app/globals.css"`.
- `.prettierignore` com `.next`, `node_modules`, `*.lock`, relatórios de teste e arquivos gerados.
- Ao introduzir o Prettier num projeto existente, a formatação geral vai num commit/PR só de formatação, separado de mudanças de lógica.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true` (acesso a array/objeto pode ser undefined), `noImplicitOverride: true`.
- Alias `@/*` → `./src/*`.
- Sem `any` e sem `as` para calar erro; se precisar de `as`, comente por quê.

## Scripts no package.json

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit"
}
```

O CI roda `lint`, `format:check`, `typecheck` e `build` em toda PR.

## Padrões de código

- Nomes de variável, função e tipo em inglês; textos da interface e comentários em português, curtos, explicando o porquê, não o quê.
- Funções pequenas e com um propósito; extraia quando um componente passar de ~150 linhas ou misturar responsabilidades.
- Sem código morto, sem `console.log` de depuração, sem comentário de código desativado.
- Constantes de negócio (frete grátis, parcelas, limites) em `config/`, não espalhadas.
- Acessibilidade: elementos interativos são `button`/`a`; campo tem `label`; ícone sozinho tem `aria-label`; foco visível.

## Ao terminar uma mudança

Rode, nesta ordem, e corrija até passar: `format`, `lint`, `typecheck`, `build`.