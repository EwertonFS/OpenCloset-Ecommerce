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
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">Você ainda não tem endereços cadastrados.</p>
              <p className="text-sm text-muted-foreground mt-2">Clique em &quot;Adicionar Novo&quot; para cadastrar seu primeiro endereço.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card key={address.id} className="hover:shadow-lg transition-shadow duration-200 border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-foreground">
                            {`${address.street}, ${address.number}`}
                          </p>
                          {address.complement && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.complement}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.district}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {`${address.city}, ${address.state}`}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-muted-foreground">
                              CEP: {address.zipCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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