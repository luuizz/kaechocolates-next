import { userFromRequest } from '@/lib/server/auth'
import { deliver, emailConfigured } from '@/lib/server/email'
import { sampleEmails } from '@/lib/server/email-templates'

// Painel: manda os 4 e-mails automáticos, com dados de exemplo, para o próprio admin
export async function POST(request: Request) {
  const user = await userFromRequest(request)
  if (!user || user.role !== 'admin') return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  if (!emailConfigured()) return Response.json({ error: 'E-mails desligados: falta RESEND_API_KEY no projeto da Vercel.' }, { status: 503 })
  if (!user.email) return Response.json({ error: 'Sua conta não tem e-mail.' }, { status: 400 })

  try {
    // Um por vez, com intervalo: o plano gratuito do Resend aceita 2 envios por segundo
    for (const [index, email] of sampleEmails(user.full_name || 'Cliente').entries()) {
      if (index) await new Promise((resolve) => setTimeout(resolve, 600))
      await deliver(user.email, email)
    }
  } catch (error) {
    console.error('[e-mail] teste', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Falha ao enviar.' }, { status: 502 })
  }
  return Response.json({ ok: true, to: user.email })
}
