// Resposta das Server Actions: erro esperado vem como dado, não como exceção
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }
