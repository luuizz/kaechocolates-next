import { cn } from '@/lib/utils'

// Selo redondo com texto girando em volta (estilo adesivo)
export function AwardBadge({ className }: { className?: string }) {
  return (
    <div className={cn('grid size-32 place-items-center rounded-full bg-foreground text-background shadow-xl md:size-36', className)}>
      <svg viewBox="0 0 120 120" className="absolute size-32 animate-spin-slow md:size-36" aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text className="fill-current text-[10.5px] font-bold uppercase tracking-[0.2em]">
          <textPath href="#badge-circle">13 prêmios internacionais · bean to bar ·</textPath>
        </text>
      </svg>
      <span className="font-display text-4xl font-bold italic leading-none text-flavor-yellow">13</span>
      <span className="sr-only">13 prêmios internacionais</span>
    </div>
  )
}
