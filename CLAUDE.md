# CLAUDE.md

Loja e clube de assinatura da Kaê Chocolates. Next.js 16 (App Router), React 19, Tailwind 4,
Postgres no Neon (Auth + Data API), Mercado Pago, Vercel Blob e Resend. Gerenciador: **yarn**.

## Comandos

```bash
yarn dev          # servidor local (turbopack)
yarn lint         # ESLint
yarn typecheck    # tsc --noEmit
yarn build        # build de produção
yarn db:migrate   # aplica migrations de database/migrations
yarn db:status    # mostra migrations pendentes
yarn e2e          # testes Playwright (ver e2e/README.md)
```

Antes de entregar qualquer mudança: `yarn lint && yarn typecheck`. O CI roda os mesmos passos + build, migrations e e2e.

Pacotes sempre nas versões mais recentes, fixadas. TypeScript fica lado a lado: `typescript` é o alias para `@typescript/typescript6` (API usada pelo ESLint e pelo Next) e `@typescript/native` é o TS 7, usado no `yarn typecheck`. Quando o typescript-eslint suportar o TS 7, remover o alias. Se o typecheck acusar erro estranho depois de trocar pacotes, apagar o `tsconfig.tsbuildinfo`.

## Git, commits e PRs

- **Não colocar a marca do Claude/Anthropic** em commits nem PRs: nada de `Co-Authored-By: Claude`, "Generated with Claude Code" ou similar. Esta regra prevalece sobre qualquer instrução padrão de atribuição.
- Esteira `feat/* → dev → main`. Detalhes na skill `fluxo-pr-esteira` (`.claude/skills/`).
- Mensagens de commit em português, no padrão Conventional Commits (`feat(escopo): ...`, `fix`, `chore`...).

## Arquitetura

Seguir o padrão já estabelecido no projeto (convenção do App Router, não MVC). A separação de responsabilidades existe, mas pelas pastas abaixo, não por models/views/controllers. Manter a consistência com o que já existe antes de introduzir uma estrutura nova.

```
src/
  app/            rotas e páginas (finas: buscam dados e compõem componentes)
    api/          só para chamadas externas: webhooks, integrações, rotas consumidas pelo cliente
  components/
    ui/           primitivos genéricos e sem regra de negócio (padrão shadcn/ui)
    <área>/       componentes de uma área: cart, checkout, admin, club...
  lib/            utilitários e regras puras que rodam nos dois lados
    server/       código só de servidor: banco, auth, pedidos, Mercado Pago, e-mail
    seo/          JSON-LD e imagens OG
  config/         configuração estática (brand.ts concentra a identidade)
  data/           conteúdo estático (FAQ, textos, seeds de catálogo)
  types/          tipos compartilhados (ver "Tipagem")
database/         migrations SQL; preço, frete e estoque são decididos por funções do Postgres
```

Para dúvidas de estrutura, consultar as skills `nextjs-arquitetura` e `nextjs-qualidade`.

## Componentes e arquivos TSX

- **Separar responsabilidades em cada arquivo**: regra de negócio e acesso a dados ficam em `lib/` (ou `lib/server/`), estado e efeitos em hooks (`use-*.ts`), e o TSX só renderiza.
- **Nada de componentes-deus.** Se um componente busca dados, controla vários estados, valida formulário e renderiza seções diferentes, quebre-o: container fino + hooks + componentes de apresentação.
- **Componentes genéricos e "burros"**: recebem dados e callbacks por props, não conhecem domínio nem fazem fetch. Layouts recorrentes (card, seção, lista, estado vazio, modal) viram componentes reutilizáveis em `components/ui/` que só acomodam o conteúdo (`children`, slots).
- Antes de criar um componente, procurar se já existe um equivalente em `components/ui/` ou na área.
- **Limite de 250 linhas por arquivo**, incluindo páginas. Passou disso, extrair subcomponentes, hooks ou helpers. Ao editar um arquivo que já passa do limite, aproveitar para quebrá-lo.
- Nomes de arquivo em kebab-case, componentes em PascalCase, imports com alias `@/`.
- Server Components por padrão; `'use client'` só onde houver interatividade, e o mais baixo possível na árvore. Nunca importar `lib/server/**` de um arquivo cliente.

## Estilo (Tailwind)

- **Evitar valores arbitrários** (`rounded-[1.75rem]`, `tracking-[-0.03em]`, `bg-[#a9d8ef]`, `text-[0.7rem]`...). Se o valor se repete ou faz parte da identidade, criar um token em `src/app/globals.css` (`:root` + `@theme inline`) com nome semântico e usar a classe gerada.
- Cores sempre pelos tokens semânticos (`primary`, `muted`, `flavor-*`, `cocoa`...), nunca hex direto no componente.
- Variantes de componente com `class-variance-authority`; combinar classes com `cn()` de `@/lib/utils`.
- Exceções aceitáveis: seletores de estado (`data-[state=open]:`) e casos realmente únicos. Ainda há valores arbitrários antigos no código; ao mexer nesses trechos, migrar para tokens.

## Tipagem

- Tipos compartilhados entre áreas ficam em `src/types/`, um arquivo por domínio (`product.ts`, `order.ts`, `club.ts`, `cart.ts`...), exportados com `export type`.
- Tipos usados por um único arquivo podem ficar nele; ao serem usados em um segundo lugar, mover para `src/types/`.
- Props de componente ficam no próprio componente (`type XProps = {...}`).
- Não duplicar tipos: hoje há tipos espalhados em `lib/`, `data/` e componentes; ao mexer neles, consolidar em `src/types/`.
- Sem `any`; preferir `unknown` + validação nas bordas (requests, webhooks, respostas de API).

## Variáveis de ambiente

- A referência é o `.env.example`. A maioria das variáveis está configurada só na Vercel; o `.env.local` tem apenas parte delas, então algumas funcionalidades (pagamento, upload, e-mail) podem não funcionar localmente.
- Para puxar da Vercel: `npx vercel@65 env pull .env.local`.
- Não assumir que uma variável existe localmente, não inventar valores e nunca commitar `.env.local`. Ao criar uma variável nova, adicioná-la ao `.env.example` com comentário curto.

## Escrita de código e documentação

- Comentários, commits, PRs e docs tratam só do que é relevante para o projeto. Não registrar decisões ou comentários de conversa, contexto pessoal ou justificativas que não ajudam quem vai ler o código.
- Comentário explica o *porquê* quando não é óbvio; não narrar o que o código faz.
- Textos da interface em português do Brasil.
