---
name: "nextjs-arquitetura"
description: "Use ao criar ou refatorar código em projetos Next.js (App Router): estrutura de pastas, servidor x cliente, backend em camadas, Server Actions, dados, cache, hooks e tipagem."
---

# Arquitetura de projetos Next.js (App Router)

O Next é o backend do próprio front (BFF). Não criar serviço de backend separado, a menos que exista outro cliente da API (app mobile, parceiro), trabalho pesado em fila ou time separado.

Antes de usar uma API do framework, confira a versão do Next no `package.json` e a doc dessa versão. As APIs mudam entre versões (no Next 16, por exemplo, `middleware.ts` virou `proxy.ts` e `revalidateTag` pede um segundo argumento).

## Estrutura de pastas

```
src/
  app/                    rotas; pastas entre parênteses agrupam sem mudar a URL: (loja), (conta)
    api/                  SÓ para quem chama de fora: webhooks, integrações, API pública
  components/
    ui/                   primitivos sem regra de negócio (button, field, dialog), padrão shadcn/ui
    <area>/               componentes de uma área (cart, checkout, admin…)
  hooks/                  hooks de cliente reaproveitados por mais de uma área (use-*.ts)
  lib/                    utilitários puros, sem I/O, que rodam nos dois lados (formatação, cálculo)
  server/                 tudo que só roda no servidor; cada arquivo começa com import 'server-only'
    db/                   cliente do banco e tipos gerados do schema
    auth/                 sessão do usuário (cookie) e guardas (requireUser, requireAdmin)
    services/             regras de negócio por domínio: catalog.ts, orders.ts, checkout.ts…
    integrations/         serviços externos: pagamento, e-mail, armazenamento
    validation/           schemas Zod (também usados pelos formulários)
  config/                 configuração estática (marca, constantes)
  types/                  tipos compartilhados que não pertencem a um domínio
```

Regras:
- Nome de arquivo em kebab-case; componentes exportados em PascalCase; hooks começam com `use`.
- Componente usado só por uma página fica junto dela (colocation). Sobe para `components/` quando outra área usar.
- Hook usado só por um componente fica no mesmo arquivo ou ao lado dele. Vai para `src/hooks` quando for reaproveitado.
- Import com alias `@/`; nada de `../../..`.
- Nunca importe `src/server/**` de um arquivo com `'use client'`.

## Servidor x cliente

- Padrão é Server Component. Use `'use client'` só onde há estado, efeito, evento ou API do navegador, e o mais fundo possível na árvore.
- Página server busca os dados e passa só o necessário (serializável) para o componente de cliente.
- Contexto de cliente (carrinho, tema) recebe os dados iniciais do servidor por props, em vez de buscar no efeito.

## Backend em camadas

Fluxo: página/action/rota → `services` → `db` / `integrations`.

- **Leituras**: Server Components chamam o service direto. Nada de `fetch` para a própria API.
- **Gravações**: Server Actions (`'use server'`) em `app/**/actions.ts` ou junto do service. Toda action:
  1. valida a entrada com Zod (`schema.safeParse`);
  2. confere quem está logado e se pode (`requireUser` / `requireAdmin`);
  3. chama o service;
  4. revalida o cache afetado;
  5. devolve um resultado tipado `{ ok: true, data } | { ok: false, error }`. Lance exceção só para erro inesperado.
- **Route Handlers** (`app/api/**/route.ts`) só para chamadas externas. Webhook nunca confia no corpo do aviso: busca o recurso na API de origem antes de gravar.
- **Services** não sabem de HTTP, cookies nem `revalidate`: recebem dados já validados e o usuário, e devolvem dados.
- **Regras de dinheiro e estoque** ficam em funções do banco (transação atômica) ou em service com transação explícita. Nunca confie em preço vindo do navegador.
- Trabalho depois da resposta (e-mail, log) com `after()`. Rotina periódica com cron da plataforma.
- Segredos só em variáveis sem `NEXT_PUBLIC_`. Variável `NEXT_PUBLIC_*` vai para o navegador.

## Dados e cache

- Banco tipado: tipos gerados a partir do schema (ex.: Drizzle com introspecção). Migrations em SQL versionado são a fonte da verdade; nunca edite uma migration já aplicada.
- Leituras públicas e caras usam cache com tag; a action que altera os dados revalida essa tag.
- Página que depende do usuário logado é dinâmica; não coloque dado de usuário em cache compartilhado.
- Se o banco tem RLS, mantenha como segunda camada de segurança, mesmo com o acesso passando pelo servidor.

## Tipagem

- `strict: true`. Sem `any`; use `unknown` e valide (Zod) na fronteira: formulário, action, rota, resposta de API externa.
- Tipo derivado do schema (`z.infer`, tipos do banco) em vez de duplicar à mão.
- Converta tipos do banco na borda do service (ex.: `numeric` chega como string; converta para number uma vez).
- Union discriminada para estados (`status: 'pending' | 'paid'`), não booleans soltos.

## Formulários

- Form chama a Server Action (`action={...}` ou `useActionState`) e mostra o erro devolvido.
- O mesmo schema Zod valida no cliente (feedback imediato) e na action (segurança).
- Mensagens de erro em português, pensadas para o cliente final.

## Antes de concluir uma tarefa

- `lint`, `typecheck` e `build` passando.
- Fluxo afetado testado no navegador; se houver testes de ponta a ponta, rode os da área.
- Nenhum `console.log` de depuração; erro inesperado vai para `console.error` com contexto.