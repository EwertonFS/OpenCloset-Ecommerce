'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckoutSteps } from "@/app/components/CheckoutSteps";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

// Dados estáticos para simulação (em um app real, viriam do servidor/URL)
const orderDetails = {
    number: "123456",
    date: new Date().toLocaleDateString('pt-BR'),
    total: 119.90,
    paymentMethod: "Cartão de Crédito",
    items: [
        {
            id: 1,
            name: "Camiseta Canelada",
            price: 119.9,
            quantity: 1,
            image: "/related-1.png",
        },
    ]
}

export default function ConfirmationPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <CheckoutSteps currentStep="confirmation" />

            <div className="flex flex-col items-center text-center mt-10">
                <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Compra finalizada com sucesso!</h1>
                <p className="text-gray-600 mb-8">Obrigado pela sua compra. Aqui estão os detalhes do seu pedido:</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border">
                <h2 className="text-xl font-semibold mb-6">Detalhes do Pedido</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Número do Pedido</p>
                        <p className="font-medium">#{orderDetails.number}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Data</p>
                        <p className="font-medium">{orderDetails.date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Forma de Pagamento</p>
                        <p className="font-medium">{orderDetails.paymentMethod}</p>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                    {orderDetails.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-x-4">
                            <div className="relative w-20 h-20 bg-gray-200 rounded-lg">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex-grow">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">
                                R$ {item.price.toFixed(2).replace(".", ",")}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-10">
                <Link href="/" passHref>
                    <Button size="lg" className="bg-[#5131E8] hover:bg-[#5131E8]/90">
                        Continuar Comprando
                    </Button>
                </Link>
            </div>
        </div>
    );
}
