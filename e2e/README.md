# Testes de ponta a ponta

Playwright navegando no site de verdade (build de produção), contra um ambiente
simulado que sobe junto. Não precisa de conta, chave ou variável de nenhum serviço.

| Peça | O que simula |
| --- | --- |
| Postgres | o banco do Neon (banco `kae_e2e`, recriado a cada execução, com todas as migrations) |
| `stack/auth.mjs` | o Neon Auth (é um Better Auth com JWT e token anônimo) |
| PostgREST | a Data API do Neon |
| `stack/proxy.mjs` | os endereços do Neon em `localhost:54321` |
| `stack/mercadopago.mjs` | a API de Orders e de assinaturas do Mercado Pago |

## O que é testado

- **Loja**: catálogo, filtros, busca, sacola, kits, layout no celular, SEO
- **Conta**: cadastro, endereços, dados, sair e entrar, senha errada
- **Checkout**: Pix do início ao fim, frete e desconto calculados no servidor, cartão aprovado e recusado, estoque
- **Clube**: assinatura, regras de pausa e cancelamento
- **Painel**: produtos, caixas, planos, frete, pedidos com rastreio, assinantes e CSV
- **Segurança**: o que visitante e cliente não podem fazer no banco e nas rotas

## Rodar no seu computador

Precisa de um Postgres e do [PostgREST](https://postgrest.org) instalados.

```bash
yarn playwright install chromium   # uma vez
E2E_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres yarn e2e
```

`yarn e2e` sobe o ambiente, faz o build com as variáveis de teste (`e2e/env.mjs`) e roda os
testes. Para repetir sem refazer o build: `yarn e2e --sem-build`. Para um arquivo só:
`yarn e2e e2e/tests/03-checkout.spec.ts`.

No CI, o job **Testes de ponta a ponta** faz o mesmo a cada PR; se falhar, o relatório com
prints e o passo a passo fica nos artefatos da execução.
