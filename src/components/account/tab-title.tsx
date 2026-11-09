type TabTitleProps = { children: React.ReactNode; description?: string }

// Título da aba ativa; o id é referenciado pela <section> da página da conta
export function TabTitle({ children, description }: TabTitleProps) {
  return (
    <header className="mb-6">
      <h2 id="titulo-aba" className="font-display text-3xl font-extrabold tracking-heading">{children}</h2>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </header>
  )
}
