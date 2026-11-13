import Link from 'next/link'
import { brand } from '@/config/brand'

export type LegalSection = { id: string; title: string; body: React.ReactNode }

const date = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string
  intro: React.ReactNode
  sections: LegalSection[]
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-24 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>{' '}
        <span aria-hidden="true">/</span> <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-4 max-w-3xl font-display text-5xl leading-display font-extrabold tracking-display md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Atualizada em {date.format(new Date(`${brand.legal.updatedAt}T00:00:00Z`))}
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <p className="text-xs font-bold tracking-eyebrow text-muted-foreground uppercase">Nesta página</p>
          <ol className="mt-4 flex flex-col gap-1 border-l text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="max-w-3xl">
          <div className="rounded-card bg-secondary p-6 text-lg leading-relaxed md:p-8">{intro}</div>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-36 border-b py-10 last:border-0">
              <h2 className="flex items-baseline gap-3 font-display text-2xl font-extrabold tracking-heading md:text-3xl">
                <span className="text-base text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>{' '}
                {section.title}
              </h2>
              <div className="legal-body mt-4 flex flex-col gap-4 leading-relaxed text-foreground/85">
                {section.body}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}

export function CompanyLine() {
  return (
    <>
      <strong>{brand.legal.company}</strong>
      {brand.legal.cnpj && <>, CNPJ {brand.legal.cnpj}</>}, com sede em {brand.contact.address}
    </>
  )
}
