import { cn } from '@/lib/utils'

type AdminHeaderProps = { title: string; description?: string; actions?: React.ReactNode }

// Cabeçalho das páginas do painel
export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-heading md:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

// Bloco branco sobre o fundo do painel
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-tile bg-panel-surface p-5 md:p-6', className)}>{children}</section>
}
