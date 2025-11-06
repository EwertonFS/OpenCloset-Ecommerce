'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PaymentMethod = 'credit-card' | 'pix' | 'boleto';

const CreditCardForm = () => (
    <div className="space-y-4">
        <div>
            <Label htmlFor="cardNumber">Número do cartão</Label>
            <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
        </div>
        <div>
            <Label htmlFor="cardName">Nome do titular</Label>
            <Input id="cardName" placeholder="Nome como no cartão" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="cardExpiry">Validade (MM/AA)</Label>
                <Input id="cardExpiry" placeholder="MM/AA" />
            </div>
            <div>
                <Label htmlFor="cardCvv">CVV</Label>
                <Input id="cardCvv" placeholder="123" />
            </div>
        </div>
    </div>
);

const PixPayment = () => (
    <div className='text-center'>
        <p className="text-sm text-gray-600 mb-4">
            Aponte a câmera do seu celular para o QR Code ou utilize o código copia e cola para realizar o pagamento.
        </p>
        {/* Placeholder for QR Code */}
        <div className="w-48 h-48 bg-gray-300 mx-auto my-4 flex items-center justify-center rounded-md">
            <span>QR Code</span>
        </div>
        <Input readOnly value="00020126580014br.gov.bcb.pix0136..." />
        <Button variant="outline" className="w-full mt-2">Copiar código</Button>
    </div>
);

const BoletoPayment = () => (
    <div className='text-center'>
        <p className="text-sm text-gray-600 mb-4">
            O boleto será gerado com vencimento para 2 dias úteis. Você pode pagar em qualquer banco ou lotérica.
        </p>
        <Button className="w-full bg-[#5131E8] hover:bg-[#5131E8]/90">
            Gerar Boleto
        </Button>
    </div>
);


export default function PaymentForm() {
    const [method, setMethod] = useState<PaymentMethod>('credit-card');

    const getButtonVariant = (m: PaymentMethod) => {
        return method === m ? 'default' : 'ghost';
    }

    return (
        <Card>
            <CardContent className='pt-6'>
                <div className="flex gap-x-1 mb-6 border-b">
                    <Button variant={getButtonVariant('credit-card')} onClick={() => setMethod('credit-card')} className='rounded-b-none'>Cartão de Crédito</Button>
                    <Button variant={getButtonVariant('pix')} onClick={() => setMethod('pix')} className='rounded-b-none'>PIX</Button>
                    <Button variant={getButtonVariant('boleto')} onClick={() => setMethod('boleto')} className='rounded-b-none'>Boleto</Button>
                </div>

                {method === 'credit-card' && <CreditCardForm />}
                {method === 'pix' && <PixPayment />}
                {method === 'boleto' && <BoletoPayment />}
            </CardContent>
        </Card>
    )
}
