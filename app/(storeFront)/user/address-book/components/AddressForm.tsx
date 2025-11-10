'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useFormStatus } from 'react-dom';

interface Address {
  id?: string;
  street: string;
  number: string;
  complement?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressFormProps {
  address: Address | null;
  onSaveAction: (prevState: { error: string } | void, formData: FormData) => Promise<{ error: string } | void>;
  redirectUrl: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Endereço'}
    </Button>
  );
}

export default function AddressForm({ address, onSaveAction }: AddressFormProps) {
  const [state, formAction] = useFormState(onSaveAction, { error: '' });

  return (
    <form action={formAction} className="space-y-4 mt-6 border-t pt-6">
      <input type="hidden" name="addressId" value={address?.id} />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="zipCode">CEP</Label>
          <Input id="zipCode" name="zipCode" placeholder="00000-000" defaultValue={address?.zipCode} required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" placeholder="País" defaultValue={address?.country} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="street">Rua</Label>
          <Input id="street" name="street" placeholder="Nome da rua" defaultValue={address?.street} required />
        </div>
        <div>
          <Label htmlFor="number">Número</Label>
          <Input id="number" name="number" placeholder="123" defaultValue={address?.number} required />
        </div>
      </div>
      <div>
        <Label htmlFor="complement">Complemento (Opcional)</Label>
        <Input id="complement" name="complement" placeholder="Apto, bloco, etc." defaultValue={address?.complement || ''} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" placeholder="Sua cidade" defaultValue={address?.city} required />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" name="state" placeholder="UF" defaultValue={address?.state} required />
        </div>
      </div>
      <div className='flex gap-x-4'>
        <SubmitButton />
      </div>
    </form>
  );
}