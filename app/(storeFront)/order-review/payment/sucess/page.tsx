'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearCart } from '@/lib/action';
import { OrderSuccessDialog } from '@/app/components/OrderSuccessDialog';

export default function OrderSuccessPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Limpa o carrinho assim que a página é montada.
    const performClearCart = async () => {
      try {
        await clearCart();
        console.log("Carrinho limpo com sucesso.");
      } catch (error) {
        console.error("Falha ao limpar o carrinho:", error);
      }
    };

    performClearCart();
  }, []); // O array vazio garante que isso rode apenas uma vez.

  const handleClose = () => {
    setIsDialogOpen(false);
    // Opcional: redirecionar o usuário para a página de pedidos após fechar o diálogo.
    router.push('/user/order');
  };

  return <OrderSuccessDialog isOpen={isDialogOpen} onClose={handleClose} />;
}
