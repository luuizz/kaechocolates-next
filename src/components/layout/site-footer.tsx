import { brand } from '@/config/brand'

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {brand.name} · {brand.contact.city}</p>
        <p>{brand.tagline}</p>
      </div>
    </footer>
  )
}
