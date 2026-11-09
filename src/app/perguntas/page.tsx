import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { brand } from '@/config/brand'
import { FAQ } from '@/data/faq'
import { JsonLd, faqPage } from '@/lib/seo/json-ld'

export const metadata: Metadata = {
  title: 'Perguntas dos chocólatras',
  description: 'Tudo sobre os chocolates, entregas, pagamento, presentes e o clube da Kaê.',
  alternates: { canonical: '/perguntas' },
}

const slug = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPage(FAQ.flatMap((group) => group.items))} />
      <PageHeader
        title="Perguntas dos chocólatras"
        description="As dúvidas que mais chegam por aqui. Não achou a sua? Chama a gente no WhatsApp."
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-10 pb-24 md:px-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Assuntos" className="lg:sticky lg:top-36 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {FAQ.map((group) => (
              <li key={group.topic}>
                <a
                  href={`#${slug(group.topic)}`}
                  className="block rounded-full border px-4 py-2 text-sm font-semibold hover:border-foreground lg:rounded-xl"
                >
                  {group.topic}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-12">
          {FAQ.map((group) => (
            <section key={group.topic} id={slug(group.topic)} className="scroll-mt-36">
              <h2 className="font-display text-3xl font-extrabold tracking-heading">{group.topic}</h2>
              <div className="mt-5 divide-y rounded-2xl border">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                      {item.q}
                      <span className="text-2xl transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted-foreground">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <div className="flex flex-col items-start gap-4 rounded-card bg-secondary p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Ainda com dúvida?</h2>
              <p className="text-muted-foreground">A gente responde rapidinho, em horário comercial.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={`https://wa.me/${brand.contact.whatsapp}`} target="_blank" rel="noreferrer">
                  <WhatsappLogo weight="bold" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contato">Outros contatos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
