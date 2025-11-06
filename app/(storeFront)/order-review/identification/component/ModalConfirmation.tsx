"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface ModalConfirmationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

const ModalConfirmation = ({ isOpen, setIsOpen, onConfirm }: ModalConfirmationProps) => {
  const router = useRouter();

  const handleConfirm = () => {
    onConfirm();
    router.push('/user');
  };

  const handleKeepShopping = () => {
    setIsOpen(false);
    router.push('/'); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-8 rounded-lg">
        <div className="mb-4">
            <Image
            src="/illustration.png"
            alt="Success" 
            width={300}
            height={300}
            />
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold mb-2">
            Pagamento realizado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Clique em Uma das Opções Abaixo:
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full grid-cols-2 gap-4 mt-6">
          <Button variant="outline" onClick={handleKeepShopping}>
            Ir para página Inicial 
          </Button>
          <Button onClick={handleConfirm}>
            Ir para Meus Pedidos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalConfirmation;
