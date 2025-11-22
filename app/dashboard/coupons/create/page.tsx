"use client";

import { createCoupon } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateCouponPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(createCoupon, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
            setTimeout(() => {
                router.push("/dashboard/coupons");
            }, 1000);
        }
    }, [state, router]);

    return (
        <form action={formAction}>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/coupons">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Novo Cupom</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Cupom</CardTitle>
                    <CardDescription>
                        Crie um novo cupom de desconto para seus clientes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="code">Código do Cupom</Label>
                        <Input
                            id="code"
                            name="code"
                            type="text"
                            placeholder="EX: VERÃO2024"
                            className="uppercase"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="type">Tipo de Desconto</Label>
                            <Select name="type" defaultValue="percentage" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label htmlFor="discount">Valor do Desconto</Label>
                            <Input
                                id="discount"
                                name="discount"
                                type="number"
                                placeholder="Ex: 10"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="expiresAt">Data de Expiração (Opcional)</Label>
                        <Input
                            id="expiresAt"
                            name="expiresAt"
                            type="date"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">Criar Cupom</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
