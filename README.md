# Kaê Chocolates

Loja virtual e clube de assinatura da Kaê Chocolates, chocolate bean to bar brasileiro.
Projeto conceito em desenvolvimento: refaz o site atual (Nuvemshop) com uma identidade
melhorada, loja completa, "Monte seu Kit" e assinatura recorrente.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) com componentes no padrão [shadcn/ui](https://ui.shadcn.com)
- Ícones [Phosphor](https://phosphoricons.com)
- Banco e autenticação no [Neon](https://neon.tech) · deploy na [Vercel](https://vercel.com)
- Pagamentos e assinaturas com Mercado Pago (modo de teste)

## Rodando localmente

```bash
yarn install
yarn dev
```

Abra http://localhost:3000.

## Marca

Tudo o que identifica a marca fica em `src/config/brand.ts` e nas cores de
`src/app/globals.css`. Trocando esses dois arquivos, o logo em `public/brand`
e as fotos, o projeto vira uma loja genérica.

## Fluxo de trabalho

`feat/*` → `dev` → `main` (produção).

- **CI** (`.github/workflows/ci.yml`): toda PR roda lint, checagem de tipos e build.
  PR para a `main` só é aceita se vier da `dev`.
- **Deploy** (`.github/workflows/deploy.yml`): cada merge na `main` publica na Vercel.
  O deploy automático pelo Git fica desligado no `vercel.json`.

### Configurar o deploy (uma vez)

1. No seu computador, na pasta do projeto: `npx vercel@65 link` e escolha o projeto
   **kaechocolates**. Isso cria `.vercel/project.json` (já está no `.gitignore`).
2. Crie um token em vercel.com/account/tokens.
3. No GitHub, em **Settings → Secrets and variables → Actions → Secrets**, crie:
   - `VERCEL_TOKEN`: o token do passo 2
   - `VERCEL_ORG_ID`: o `orgId` do `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: o `projectId` do `.vercel/project.json`
4. Em **Settings → Rules → Rulesets**, proteja a `main` exigindo PR e os checks
   "Origem do PR" e "Lint, tipos e build".
