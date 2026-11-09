import { redirect } from 'next/navigation'
import { AccessBlocked } from '@/components/admin/access-blocked'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAdminAccess } from '@/lib/server/session'

// Lê a sessão do cookie a cada requisição: o painel nunca é gerado como página estática
export const dynamic = 'force-dynamic'

// O proxy já exige login; aqui o banco confirma se a conta é admin
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess()
  if (access.status === 'anonymous') redirect('/entrar?volta=/admin')
  if (access.status === 'forbidden')
    return (
      <AccessBlocked
        title="Acesso restrito"
        text="Esta área é só para a equipe da loja. Se você deveria ter acesso, peça para um admin liberar sua conta."
      />
    )
  return (
    <AdminShell name={access.profile.full_name || 'Admin'} email={access.profile.email ?? ''}>
      {children}
    </AdminShell>
  )
}
