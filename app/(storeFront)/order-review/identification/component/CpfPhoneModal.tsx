"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IMaskInput } from "react-imask";
import { updateUserCpfPhone } from "@/lib/action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CpfPhoneModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (cpf: string, phone: string) => void;
}

export function CpfPhoneModal({ isOpen, onOpenChange, onSuccess }: CpfPhoneModalProps) {
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("cpf", cpf);
        formData.append("phone", phone);

        const result = await updateUserCpfPhone(formData);

        setIsLoading(false);

        if (result.error) {
            toast.error(result.error as string);
        } else {
            toast.success("Dados atualizados com sucesso!");
            onSuccess(cpf, phone);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete seu cadastro</DialogTitle>
                    <DialogDescription>
                        Precisamos do seu CPF e Telefone para emitir a nota fiscal e entrar em contato sobre a entrega.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <IMaskInput
                            mask="000.000.000-00"
                            value={cpf}
                            onAccept={(value: string) => setCpf(value)}
                            placeholder="000.000.000-00"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <IMaskInput
                            mask="(00) 00000-0000"
                            value={phone}
                            onAccept={(value: string) => setPhone(value)}
                            placeholder="(00) 00000-0000"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar e Continuar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
