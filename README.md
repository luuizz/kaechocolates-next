# Kaê Chocolates

Loja virtual e clube de assinatura da Kaê Chocolates, chocolate bean to bar brasileiro.
Projeto conceito em desenvolvimento: refaz o site atual (Nuvemshop) com uma identidade
melhorada, loja completa, "Monte seu Kit" e assinatura recorrente.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) com componentes no padrão [shadcn/ui](https://ui.shadcn.com)
- Ícones [Phosphor](https://phosphoricons.com)
- Banco, login e Data API no [Neon](https://neon.tech) · fotos no Vercel Blob · deploy na [Vercel](https://vercel.com)
- Pagamentos e assinaturas com Mercado Pago (modo de teste)

## Rodando localmente

```bash
yarn install
cp .env.example .env.local   # preencha com os endereços do Neon
yarn dev
```

Abra http://localhost:3000. Sem as variáveis do Neon o site abre com o catálogo
de reserva (`src/data`), mas sem login, conta e painel.

## Banco, login e painel

- **Neon Auth**: login, cadastro, recuperação de senha. A sessão fica no navegador.
- **Data API**: o site lê e grava direto nas tabelas, com o token do usuário.
  Quem pode o quê é decidido no banco, por RLS (`database/migrations/0001_schema.sql`):
  visitante só lê o catálogo ativo, cliente só vê os próprios dados e endereços,
  admin edita o catálogo.
- **Catálogo** (`src/lib/catalog.ts`): lido no servidor com um token anônimo e guardado
  em cache por 5 minutos. O painel limpa o cache ao salvar (`/api/revalidate`), então a
  mudança aparece na hora. Se o banco estiver fora do ar, a loja usa a lista de reserva.
- **Fotos** (`/api/images`): upload no Vercel Blob, liberado só para admin (a rota pergunta
  ao banco, via `rpc/is_admin`, com o token de quem enviou).
- **Painel** em `/admin`: barras (com prévia da embalagem e foto), caixas do kit,
  planos e períodos do clube, clientes.

### Migrations

Ficam em `database/migrations` e rodam em ordem. Nunca edite uma que já foi aplicada:
crie a próxima (`0003_...sql`).

```bash
yarn db:status    # o que falta aplicar
yarn db:migrate   # aplica (usa DATABASE_URL do .env.local)
```

No CI, as migrations rodam do zero num Postgres de teste (com `database/ci/neon-stub.sql`
simulando o Neon). No deploy da `main`, rodam no Neon antes de publicar.

### Primeiro admin

Crie a conta pelo site (`/cadastro`) e, no SQL Editor do Neon:

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

Saia e entre de novo: o link **Painel** aparece no cabeçalho.

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
4. Ainda em **Secrets**, para as migrations:
   - `NEON_DATABASE_URL`: connection string **direta** do Neon (sem `-pooler`)
   - `NEON_API_KEY`: chave da API do Neon (recarrega o cache da Data API depois das migrations)
5. Em **Variables**: `NEON_PROJECT_ID` (Neon → Settings → General).
6. Na Vercel (Settings → Environment Variables), como variáveis comuns:
   `NEXT_PUBLIC_NEON_AUTH_URL` e `NEXT_PUBLIC_NEON_DATA_API_URL`. Conecte um Blob Store
   público ao projeto (Storage), que cria `BLOB_READ_WRITE_TOKEN`.
7. No Neon Auth, em domínios confiáveis: o domínio do site, o `.vercel.app` e
   `http://localhost:3000`.
8. Em **Settings → Rules → Rulesets**, proteja a `main` exigindo PR e os checks
   "Origem do PR", "Lint, tipos e build" e "Migrations (Postgres de teste)".
