# Configuração e operação

Tudo o que é preciso para rodar, publicar e operar a loja. A visão geral do projeto está no [README](../README.md).

## Rodar localmente

```bash
yarn install
cp .env.example .env.local   # preencha com os endereços do Neon
yarn dev
```

Abra http://localhost:3000. Sem as variáveis do Neon o site abre com o catálogo
de reserva (`src/data`), mas sem login, conta e painel.

## Migrations

Ficam em `database/migrations` e rodam em ordem. Nunca edite uma que já foi aplicada:
crie a próxima (`0005_...sql`).

```bash
yarn db:status    # o que falta aplicar
yarn db:migrate   # aplica (usa DATABASE_URL do .env.local)
```

No CI, as migrations rodam do zero num Postgres de teste (com `database/ci/neon-stub.sql`
simulando o Neon). No deploy da `main`, rodam no Neon antes de publicar.

## Sessão (login)

O login passa por `/api/auth` (mesmo domínio da loja) e a sessão fica num cookie
assinado, que o `proxy.ts` e o layout do painel leem no servidor.

| Variável                  | Tipo      | O que é                                                                                         |
| ------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `NEON_AUTH_COOKIE_SECRET` | Sensitive | Segredo de 32+ caracteres que assina o cookie (`openssl rand -base64 32`). Production e Preview |

Sem ela o site abre, mas o login responde "indisponível".

## Primeiro admin

Crie a conta pelo site (`/cadastro`) e, no SQL Editor do Neon:

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

Saia e entre de novo: o link **Painel** aparece no cabeçalho.

## Variáveis do Mercado Pago (Vercel)

| Variável                             | Tipo      | O que é                                                                                           |
| ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                       | Sensitive | Connection string do Neon **com `-pooler`** (a integração Neon + Vercel já cria)                  |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | comum     | Public Key da aplicação                                                                           |
| `MERCADOPAGO_ACCESS_TOKEN`           | Sensitive | Access Token da aplicação                                                                         |
| `MERCADOPAGO_WEBHOOK_SECRET`         | Sensitive | Assinatura secreta dos webhooks                                                                   |
| `MERCADOPAGO_TEST_MODE`              | comum     | `true` enquanto usar a conta de teste: aprova o Pix sozinho                                       |
| `MERCADOPAGO_TEST_PAYER_EMAIL`       | comum     | E-mail da conta **compradora de teste** (o Mercado Pago exige um usuário de teste como assinante) |

## E-mails automáticos

Enviados pelo [Resend](https://resend.com) com modelos próprios (`src/lib/server/email-templates.ts`):
pedido recebido (com o Pix copia e cola), pagamento aprovado, pedido enviado (com rastreio)
e boas-vindas ao clube. Cada aviso sai uma vez só (tabela `email_log`). Sem
`RESEND_API_KEY`, o site funciona igual e não manda e-mail.

| Variável         | Tipo            | O que é                                                                                         |
| ---------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Sensitive       | Chave da API do Resend (permissão de envio)                                                     |
| `EMAIL_FROM`     | comum, opcional | Remetente. Padrão: `Kaê Chocolates <pedidos@dominio-do-site>`. Não precisa ter caixa de entrada |
| `EMAIL_REPLY_TO` | comum, opcional | Para onde vão as respostas dos clientes. Padrão: o e-mail de contato em `brand.ts`              |

O domínio do remetente precisa estar verificado no Resend (Domains), com os registros de
DNS que ele indicar.

## Testar pagamentos

Use as **credenciais de teste** da aplicação do Mercado Pago (Suas integrações → aplicação →
Credenciais → Teste). Para as assinaturas, o assinante precisa ser a conta **compradora de
teste** (`MERCADOPAGO_TEST_PAYER_EMAIL`).

- **Pix**: com `MERCADOPAGO_TEST_MODE=true`, o pedido é aprovado em alguns segundos.
- **Cartão**: Mastercard `5031 4332 1540 6351`, validade `11/30`, CVV `123`, CPF `12345678909`.
  O nome no cartão define o resultado: `APRO` aprova, `OTHE` recusa, `FUND` recusa por saldo.
- **Webhook**: na mesma aplicação, em Configuração de webhooks, URL
  `https://<site>/api/mercadopago/webhook` (de teste e de produção), eventos **Order** e
  **Planos e assinaturas**. Salve a página antes de copiar a assinatura secreta para
  `MERCADOPAGO_WEBHOOK_SECRET`.

## Configurar o deploy (uma vez)

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
   "Origem do PR", "Lint, tipos e build", "Migrations (Postgres de teste)"
   e "Testes de ponta a ponta". Na `dev`, os mesmos checks menos "Origem do PR".
