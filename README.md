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

`feature/*` → `dev` → `main` (produção).
