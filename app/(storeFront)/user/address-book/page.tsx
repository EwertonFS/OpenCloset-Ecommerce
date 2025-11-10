'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getUserAddresses } from '@/lib/action';
import AddressBookForm from './components/AddressBookForm';
import { useRouter } from 'next/navigation';

interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string | null;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAddresses = async () => {
      const fetchedAddresses = await getUserAddresses();
      
      // Filtrar endereços duplicados antes de definir o estado
      const uniqueAddresses = new Map<string, Address>();
      fetchedAddresses.forEach((address: Address) => {
        const addressKey = `${address.street}-${address.number}-${address.zipCode}`.toLowerCase();
        if (!uniqueAddresses.has(addressKey)) {
          uniqueAddresses.set(addressKey, address);
        }
      });

      setAddresses(Array.from(uniqueAddresses.values()));
    };
    fetchAddresses();
  }, []);

  const handleSave = () => {
    setIsAddingAddress(false);
    // Re-fetch addresses after saving
    const fetchAddresses = async () => {
        const fetchedAddresses = await getUserAddresses();
        setAddresses(fetchedAddresses);
      };
    fetchAddresses();
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Endereços</h1>
        {!isAddingAddress && (
            <Button onClick={() => setIsAddingAddress(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo
            </Button>
        )}
      </div>

      {isAddingAddress ? (
        <AddressBookForm 
            onSave={handleSave} 
            onCancel={() => setIsAddingAddress(false)} 
            initialData={null} 
        />
      ) : (
        <div>
          {addresses.length === 0 ? (
            <p>Você ainda não tem endereços cadastrados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="pt-6 text-sm">
                    <p className="font-medium">{`${address.street}, ${address.number}`}</p>
                    {address.complement && <p className="text-gray-600">{address.complement}</p>}
                    <p className="text-gray-600">{`${address.district}, ${address.city}, ${address.state} - ${address.zipCode}`}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}