'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAddress } from '@/lib/action';

interface Address {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressBookFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData: Omit<Address, 'country'> | null;
}

export default function AddressBookForm({ onSave, onCancel, initialData }: AddressBookFormProps) {
  const [address, setAddress] = useState<Address>({
    street: initialData?.street || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    district: initialData?.district || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: 'Brasil',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setAddress(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCepSearch = async () => {
    if (!address.zipCode) {
      return;
    }

    // Remove caracteres não numéricos do CEP
    const cleanZipCode = address.zipCode.replace(/\D/g, '');

    if (cleanZipCode.length !== 8) {
      setError('CEP inválido. Digite um CEP com 8 dígitos.');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP. Tente novamente.');
      }

      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado. Verifique o número digitado.');
        return;
      }

      setAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        district: data.bairro || prev.district,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
      setError(null); // Limpa erro se busca foi bem-sucedida
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setError('Não foi possível buscar o CEP. Verifique sua conexão com a internet e tente novamente.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData();
    Object.keys(address).forEach(key => {
      formData.append(key, address[key as keyof Address] || '');
    });

    const result = await createAddress(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-6">
      {error && <p className="text-red-500">{error}</p>}
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
        <Input id="complement" name="complement" placeholder="Apto, bloco, etc." value={address.complement} onChange={handleChange} />
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
        <Button type="submit">Salvar Endereço</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
