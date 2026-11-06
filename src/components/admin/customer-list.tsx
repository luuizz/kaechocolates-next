'use client'

import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/field'
import { listCustomers, type Customer } from '@/lib/admin-api'
import { formatPhone } from '@/lib/utils'
import { AdminHeader, Panel } from './admin-shell'

const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    listCustomers().then(setCustomers).catch((err) => toast.error(err.message))
  }, [])

  const list = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (customers ?? []).filter((customer) => !term || `${customer.full_name ?? ''} ${customer.email ?? ''} ${customer.phone ?? ''}`.toLowerCase().includes(term))
  }, [customers, search])

  return (
    <>
      <AdminHeader title="Clientes" description={customers ? `${customers.length} contas` : 'Carregando…'} />
      <Panel className="p-0 md:p-0">
        <div className="border-b p-4 md:p-5">
          <div className="relative md:w-80">
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou telefone" aria-label="Buscar clientes" className="h-11 pl-10" />
          </div>
        </div>
        {!customers ? (
          <div className="h-48 animate-pulse" />
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Nenhuma conta encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Nome</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Contato</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Desde</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-5 py-3 font-semibold">{customer.full_name || '—'}</td>
                    <td className="px-3 py-3">
                      <a href={`mailto:${customer.email}`} className="block hover:underline">{customer.email}</a>
                      {customer.phone && <a href={`https://wa.me/55${customer.phone}`} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><WhatsappLogo /> {formatPhone(customer.phone)}</a>}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{date.format(new Date(customer.created_at))}</td>
                    <td className="px-5 py-3">{customer.role === 'admin' ? <span className="rounded-full bg-flavor-yellow px-2.5 py-1 text-xs font-bold">Admin</span> : <span className="text-muted-foreground">Cliente</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
