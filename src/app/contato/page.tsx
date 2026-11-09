import type { Metadata } from 'next'
import { EnvelopeSimple, InstagramLogo, MapPin, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { PageHeader } from '@/components/layout/page-header'
import { ContactForm } from '@/components/contact/contact-form'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a Kaê pelo WhatsApp, e-mail ou Instagram.',
  alternates: { canonical: '/contato' },
}

const channels = [
  {
    icon: WhatsappLogo,
    label: 'WhatsApp',
    value: brand.contact.phone,
    href: `https://wa.me/${brand.contact.whatsapp}`,
  },
  { icon: EnvelopeSimple, label: 'E-mail', value: brand.contact.email, href: `mailto:${brand.contact.email}` },
  { icon: InstagramLogo, label: 'Instagram', value: '@kaechocolates', href: brand.social.instagram },
  { icon: MapPin, label: 'Endereço', value: brand.contact.address },
]

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Fale com a gente"
        crumb="Contato"
        description="Dúvida, presente especial, revenda ou só vontade de conversar sobre chocolate."
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-10 pb-24 md:px-8 lg:grid-cols-[1fr_1.3fr]">
        <ul className="flex flex-col gap-3">
          {channels.map(({ icon: Icon, label, value, href }) => {
            const content = (
              <>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary">
                  <Icon size={24} weight="duotone" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {label}
                  </span>
                  <span className="block font-semibold break-words">{value}</span>
                </span>
              </>
            )
            return (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-foreground"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border p-4">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
        <ContactForm />
      </div>
    </>
  )
}
