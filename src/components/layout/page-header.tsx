import Link from 'next/link'

// Topo padrão das páginas internas: trilha, título e texto de apoio
export function PageHeader({ title, description, crumb }: { title: string; description?: string; crumb?: string }) {
  return (
    <header className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Início</Link> <span aria-hidden="true">/</span> <span className="text-foreground">{crumb ?? title}</span>
      </nav>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-6xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}
    </header>
  )
}
