import { MapPin, PencilSimple, Star, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatCep } from '@/lib/address'
import type { Address } from '@/types/account'

type AddressCardProps = { address: Address; onEdit: () => void; onMakeDefault: () => void; onRemove: () => void }

export function AddressCard({ address, onEdit, onMakeDefault, onRemove }: AddressCardProps) {
  return (
    <li className="flex flex-col rounded-tile border p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-display font-bold">
          <MapPin size={18} weight="duotone" /> {address.label || 'Endereço'}
        </p>
        {address.is_default && (
          <span className="rounded-full bg-flavor-yellow px-2.5 py-0.5 text-xs font-bold">Padrão</span>
        )}
      </div>
      <p className="mt-2 text-sm">{address.recipient}</p>
      <p className="text-sm text-muted-foreground">
        {address.street}, {address.number}
        {address.complement ? ` · ${address.complement}` : ''}
      </p>
      <p className="text-sm text-muted-foreground">
        {address.district} · {address.city}/{address.state} · {formatCep(address.cep)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <PencilSimple /> Editar
        </Button>
        {!address.is_default && (
          <Button size="sm" variant="ghost" onClick={onMakeDefault}>
            <Star /> Tornar padrão
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onRemove}>
          <Trash /> Remover
        </Button>
      </div>
    </li>
  )
}
