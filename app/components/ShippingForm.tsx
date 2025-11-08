"use client";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ShippingForm() {
  return (
    <div className="w-full">
        <h2 className="text-2xl font-semibold mb-6">Entrega</h2>
        <form className="space-y-6">
            <Input type="email" placeholder="E-mail ou número de celular" className="py-6"/>
            
            <div className="space-y-2">
                <Label htmlFor="country">País/Região</Label>
                <Select>
                    <SelectTrigger id="country" className="py-6">
                        <SelectValue placeholder="Brasil" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="brasil">Brasil</SelectItem>
                        <SelectItem value="usa">Estados Unidos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="first-name">Nome</Label>
                    <Input id="first-name" placeholder="Nome" className="py-6"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Sobrenome</Label>
                    <Input id="last-name" placeholder="Sobrenome" className="py-6"/>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Endereço" className="py-6"/>
            </div>

            <div className="space-y-2">
                <Label htmlFor="apartment">Apartamento, suíte, etc. (opcional)</Label>
                <Input id="apartment" placeholder="Apartamento, suíte, etc." className="py-6"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="Cidade" className="py-6"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                     <Select>
                        <SelectTrigger id="state" className="py-6">
                            <SelectValue placeholder="Selecione o Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sp">São Paulo</SelectItem>
                            <SelectItem value="rj">Rio de Janeiro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="CEP" className="py-6"/>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="save-info" />
                <Label htmlFor="save-info">Salvar minhas informações para a próxima vez</Label>
            </div>
        </form>
    </div>
  );
}
