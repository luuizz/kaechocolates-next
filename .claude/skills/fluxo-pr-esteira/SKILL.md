---
name: 'fluxo-pr-esteira'
description: 'Use ao versionar e entregar mudanças em projetos com esteira feat → dev → main: branches, commits, PRs, release para a main e conferência do CI.'
---

# Fluxo de PRs e esteira

Esteira: `feat/*` (ou `fix/*`, `docs/*`, `test/*`, `refactor/*`) → PR para `dev` → PR de release `dev` → `main` → deploy.
O usuário faz os merges. Não faça merge, force push nem push direto em `dev` ou `main`.

## Branch

- Sempre a partir da `dev` atualizada: `git fetch origin dev && git checkout -B <tipo>/<assunto> origin/dev`.
- Nome curto em português e kebab-case: `feat/checkout`, `fix/webhook-simulacao`, `refactor/server-actions-painel`.
- Uma branch por assunto. Mudança grande vira PRs menores que funcionam sozinhos.

## Commits

- Conventional Commits com escopo e mensagem em português: `feat(clube): assinatura recorrente pelo Mercado Pago`.
- Corpo com tópicos curtos do que mudou e por quê.
- **Sem nenhuma marca de IA**: nada de `Co-Authored-By`, link de sessão ou "Generated with…". Escreva como uma pessoa da equipe escreveria.
- Antes de commitar: `lint`, `typecheck` e `build` passando; `.env*` e segredos nunca entram.

## PR para a dev

Título em português, curto, dizendo o resultado ("Checkout com Pix e cartão, pedidos e frete").
Corpo com:

- **O que entra**, agrupado por área.
- **Antes do merge na main**: variáveis, secrets ou configurações que o usuário precisa criar, com nome exato e tipo (comum ou Sensitive).
- **Migrations novas**, se houver.
- **Testado**: o que foi verificado e como. Diga com franqueza o que não deu para testar.
  Sem marcas de IA no corpo.

## Conferir o CI

Depois do push, acompanhe os checks até terminarem. Se algum falhar, leia o log, corrija na mesma branch e só então avise o usuário. Nunca diga que está pronto com check vermelho ou pendente.

## Release para a main

Só depois que o usuário mergear o PR na `dev` (antes disso não há diferença entre as branches):

- PR `dev` → `main`, título `Release: <resumo>`.
- Corpo listando os PRs que entram (`#N título` + uma linha), as migrations novas (rodam sozinhas no deploy) e as variáveis que precisam existir antes do merge.
- Confira o CI da release e avise que pode mergear.

## Depois do deploy

Confira se o workflow de deploy terminou com sucesso (incluindo as migrations) e passe ao usuário um roteiro curto de teste do que mudou no site publicado.
