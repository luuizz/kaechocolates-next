import Link from 'next/link'

export function PageHeader({ title, description, crumb }: { title: string; description?: string; crumb?: string }) {
  return (
    <header className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>{' '}
        <span aria-hidden="true">/</span> <span className="text-foreground">{crumb ?? title}</span>
      </nav>
      <h1 className="mt-4 max-w-3xl font-display text-5xl leading-display font-extrabold tracking-display md:text-6xl">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}
    </header>
  )
}
