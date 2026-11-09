import type { z } from 'zod'

export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string }

// Valida e devolve a mensagem do primeiro campo inválido, na ordem de `messages`
// (a ordem define qual erro o cliente vê quando há mais de um).
export function parseWith<S extends z.ZodType>(
  schema: S,
  input: unknown,
  messages: Record<string, string>,
  fallback = 'Dados inválidos.',
): Parsed<z.output<S>> {
  const result = schema.safeParse(input)
  if (result.success) return { ok: true, data: result.data }
  const failed = new Set(result.error.issues.map((issue) => String(issue.path[0] ?? '')))
  const field = Object.keys(messages).find((key) => failed.has(key))
  return { ok: false, error: field ? messages[field]! : fallback }
}
