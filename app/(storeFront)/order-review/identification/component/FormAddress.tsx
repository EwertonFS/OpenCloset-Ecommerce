'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Estrutura do Endereço
interface Address {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  district: string;
}

interface FormAddressProps {
  address: (Address & { id?: string, country?: string }) | null;
  onCheckout: (address: Address) => Promise<void>;
  isSubmitting: boolean;
  onAddressChange: (address: Address) => void; // Nova prop
}

// Componente do formulário de endereço
const AddressForm = ({ onSave, onCancel, initialData, isSubmitting, onAddressChange }: { onSave: (newAddress: Address) => void, onCancel: () => void, initialData: Address | null, isSubmitting: boolean, onAddressChange: (address: Address) => void }) => {
    const [address, setAddress] = useState<Address>(initialData || {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: ''
    });

    useEffect(() => {
        if (initialData) {
            setAddress(initialData);
        }
    }, [initialData]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newAddress = { ...address, [name]: value };
        setAddress(newAddress);
        onAddressChange(newAddress); // Notifica a mudança
    };

    const handleCepSearch = async () => {
        if (address.zipCode) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${address.zipCode}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const newAddress = {
                        ...address,
                        street: data.logradouro,
                        district: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    };
                    setAddress(newAddress);
                    onAddressChange(newAddress); // Notifica a mudança
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(address);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <Label htmlFor="zipCode">CEP</Label>
              <Input id="zipCode" name="zipCode" placeholder="00000-000" required value={address.zipCode} onChange={handleChange} />
            </div>
            <div className="md:col-span-1">
                <Button type="button" onClick={handleCepSearch}>Buscar CEP</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input id="street" name="street" placeholder="Nome da rua" required value={address.street} onChange={handleChange} />
             </div>
             <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" name="number" placeholder="123" required value={address.number} onChange={handleChange} />
             </div>
          </div>
          <div>
            <Label htmlFor="complement">Complemento (Opcional)</Label>
            <Input id="complement" name="complement" placeholder="Apto, bloco, etc." value={address.complement || ''} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="district">Bairro</Label>
              <Input id="district" name="district" placeholder="Seu bairro" required value={address.district} onChange={handleChange} />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" placeholder="Sua cidade" required value={address.city} onChange={handleChange} />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" placeholder="UF" required value={address.state} onChange={handleChange} />
            </div>
          </div>
          <div className='flex gap-x-4'>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar e Continuar'}</Button>
            <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
          </div>
        </form>
    )
}

// Componente principal que gerencia a seleção e o fluxo
export default function FormAddress({ address: initialAddress, onCheckout, isSubmitting, onAddressChange }: FormAddressProps) {
  const [choice, setChoice] = useState(initialAddress ? 'existing' : 'new');

  const handleSaveAndContinue = (newAddress: Address) => {
    onCheckout(newAddress);
  };

  const handleConfirmAndContinue = () => {
    if (initialAddress) {
        onCheckout(initialAddress);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço de Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {initialAddress && (
                <div className={`p-4 border rounded-md cursor-pointer ${choice === 'existing' ? 'border-primary' : ''}`} onClick={() => setChoice('existing')}>
                    <div className="flex items-center space-x-3">
                        <input type="radio" id="existing" name="addressChoice" value="existing" checked={choice === 'existing'} onChange={() => setChoice('existing')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                        <Label htmlFor="existing" className="font-bold text-base cursor-pointer">Usar este endereço</Label>
                    </div>
                    {choice === 'existing' && (
                        <div className="pl-7 mt-2 text-sm text-gray-700">
                            <p>{`${initialAddress.street}, ${initialAddress.number}`}</p>
                            <p>{initialAddress.district}</p>
                            <p>{`${initialAddress.city}, ${initialAddress.state} - ${initialAddress.zipCode}`}</p>
                        </div>
                    )}
                </div>
            )}

            <div className={`p-4 border rounded-md cursor-pointer ${choice === 'new' ? 'border-primary' : ''}`} onClick={() => setChoice('new')}>
                <div className="flex items-center space-x-3">
                    <input type="radio" id="new" name="addressChoice" value="new" checked={choice === 'new'} onChange={() => setChoice('new')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                    <Label htmlFor="new" className="font-bold text-base cursor-pointer">
                        {initialAddress ? 'Entregar em outro endereço' : 'Adicionar endereço de entrega'}
                    </Label>
                </div>
            </div>
        </div>

        {choice === 'new' && (
            <AddressForm 
                onSave={handleSaveAndContinue} 
                onCancel={() => setChoice(initialAddress ? 'existing' : 'new')} 
                initialData={null}
                isSubmitting={isSubmitting}
                onAddressChange={onAddressChange} // Passa a prop para o formulário
            />
        )}

        {choice === 'existing' && initialAddress && (
            <Button onClick={handleConfirmAndContinue} disabled={isSubmitting} className="w-full mt-6 bg-[#5131E8] hover:bg-[#5131E8]/90">
                {isSubmitting ? 'Processando...' : 'Continuar para Pagamento'}
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
