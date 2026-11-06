import { Star } from '@phosphor-icons/react/dist/ssr'

// Avaliações reais de clientes (ex.: importadas do Reclame Aqui ou do pós-compra).
// A seção só aparece quando houver avaliações cadastradas: nada de depoimento inventado.
export type Review = { author: string; date: string; rating: number; text: string; source?: string }

export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Quem provou, conta</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <figure key={`${review.author}-${review.date}`} className="flex flex-col rounded-2xl border p-6">
            <div className="flex gap-0.5" aria-label={`${review.rating} de 5 estrelas`}>
              {Array.from({ length: 5 }, (_, index) => <Star key={index} size={18} weight={index < review.rating ? 'fill' : 'regular'} />)}
            </div>
            <blockquote className="mt-4 flex-1 font-display text-lg font-semibold">{review.text}</blockquote>
            <figcaption className="mt-6 flex justify-between border-t pt-4 text-sm"><strong>{review.author}</strong><span className="text-muted-foreground">{review.date}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
