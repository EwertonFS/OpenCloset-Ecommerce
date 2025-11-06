'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessDialog({ isOpen, onClose }: OrderSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] rounded-2xl">
        <DialogHeader className="items-center text-center">
          <div className="rounded-full bg-green-100 p-4">
            <Image
              src="/icons/order-success.svg"
              alt="Order Success"
              width={36}
              height={27}
            />
          </div>
          <DialogTitle className="text-2xl font-bold pt-4">
            Pedido Efetuado!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Seu pedido foi efetuado com sucesso. Você pode acompanhar o status na
            seção de “Meus Pedidos”.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <Button variant="outline" asChild>
            <Link href="/">Página inicial</Link>
          </Button>
          <Button asChild>
            <Link href="/user/order">Ver meu pedido</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
