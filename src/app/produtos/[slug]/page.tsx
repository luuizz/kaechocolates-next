import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CreditCard, Leaf, Plant, Truck } from '@phosphor-icons/react/dist/ssr'
import { BarPackage } from '@/components/product/bar-package'
import { BuyBox } from '@/components/product/buy-box'
import { ProductCard } from '@/components/product/product-card'
import { brand } from '@/config/brand'
import { LINES, LINE_SINGULAR, findProduct, formatBRL, installment } from '@/data/products'
import { getCatalog } from '@/lib/server/catalog'
import { JsonLd, breadcrumbs, productLd } from '@/lib/seo/json-ld'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = findProduct((await getCatalog()).products, (await params).slug)
  if (!product) return {}
  const title = `${product.name} ${product.cacao}%`
  const description = `${product.short} Chocolate ${LINE_SINGULAR[product.line]} bean to bar, ${product.weight}.`
  return {
    title,
    description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: { type: 'website', locale: 'pt_BR', siteName: brand.name, title: `${title} · ${brand.name}`, description, url: `/produtos/${product.slug}` },
  }
}

export default async function ProductPage({ params }: Params) {
  const { products } = await getCatalog()
  const product = findProduct(products, (await params).slug)
  if (!product) notFound()

  const related = products.filter((item) => item.line === product.line && item.slug !== product.slug && !item.soldOut).slice(0, 4)
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
      <JsonLd data={[productLd(product), breadcrumbs([{ name: 'Início', path: '/' }, { name: LINES[product.line], path: `/produtos?linha=${product.line}` }, { name: product.name, path: `/produtos/${product.slug}` }])]} />
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Início</Link> <span aria-hidden="true">/</span>{' '}
        <Link href={`/produtos?linha=${product.line}`} className="hover:text-foreground">{LINES[product.line]}</Link> <span aria-hidden="true">/</span>{' '}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-[2rem] lg:sticky lg:top-36 lg:self-start" style={{ background: product.tile }}>
          {product.badge && <span className="absolute left-5 top-5 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{product.badge}</span>}
          <BarPackage product={product} priority className="mx-auto w-full max-w-lg" />
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Chocolate {LINE_SINGULAR[product.line]} · {product.cacao}% cacau</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.short}</p>

          <div className="mt-8 border-y py-6">
            {product.compareAt && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <s>{formatBRL(product.compareAt)}</s>
                <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-bold text-background">-{discount}%</span>
              </p>
            )}
            <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">{formatBRL(product.price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">ou {brand.commerce.maxInstallments}x de {installment(product.price)} sem juros · {product.weight}</p>
          </div>

          <div className="mt-6"><BuyBox product={product} /></div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            <li className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm"><Truck size={24} weight="duotone" className="shrink-0" /> Frete grátis acima de R$ {brand.commerce.freeShippingFrom}</li>
            <li className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm"><CreditCard size={24} weight="duotone" className="shrink-0" /> Pix, cartão ou boleto</li>
            <li className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm"><Plant size={24} weight="duotone" className="shrink-0" /> Bean to bar, cacau da Bahia</li>
            <li className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm"><Leaf size={24} weight="duotone" className="shrink-0" /> Sem conservantes nem aromatizantes</li>
          </ul>

          <div className="mt-8 divide-y rounded-2xl border">
            {[
              { title: 'Sobre o chocolate', body: product.description || `${product.short} Feito do grão à barra, em pequenos lotes, com cacau da Bahia.` },
              { title: 'Ingredientes e alérgicos', body: product.ingredients || 'Informações completas em breve. Em caso de alergia, fale com a gente antes de comprar.' },
              { title: 'Como conservar', body: 'Guarde em local seco e fresco, entre 15 °C e 22 °C, longe do sol e de cheiros fortes. Evite a geladeira.' },
            ].map((section, index) => (
              <details key={section.title} open={index === 0} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display font-bold">
                  {section.title}
                  <span className="text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground">{section.body}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">Você também pode gostar</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      )}
    </div>
  )
}
