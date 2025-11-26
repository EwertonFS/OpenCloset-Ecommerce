import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/app/helpers";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                            color: true,
                        }
                    }
                }
            },
            address: {
                include: {
                    user: true,
                }
            },
        },
    });

    if (!order) {
        return notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderData = order as any;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white text-black font-sans print:p-0">
            {/* Cabeçalho */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">FoxFit</h1>
                <p className="text-sm text-gray-600">Recibo de Entrega / Pedido</p>
                <p className="text-sm text-gray-600">{new Date(orderData.createdAt).toLocaleDateString('pt-BR')} às {new Date(orderData.createdAt).toLocaleTimeString('pt-BR')}</p>
            </div>

            {/* Informações do Pedido */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Cliente</h2>
                    <p className="font-bold text-lg">{orderData.address?.user?.firstName} {orderData.address?.user?.lastName}</p>
                    <p className="text-sm">CPF: {orderData.address?.user?.cpf || 'N/A'}</p>
                    <p className="text-sm">Tel: {orderData.address?.user?.phone || 'N/A'}</p>
                    <p className="text-sm">{orderData.address?.user?.email}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Nº do Pedido</h2>
                    <p className="font-bold text-xl">#{orderData.id.slice(0, 8).toUpperCase()}</p>
                    <div className="mt-2 inline-block px-3 py-1 border border-black rounded-full text-xs font-bold uppercase">
                        Entrega Local (Motoboy)
                    </div>
                </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Endereço de Entrega</h2>
                <p className="text-lg font-medium">
                    {orderData.address?.street}, {orderData.address?.number}
                </p>
                {orderData.address?.complement && (
                    <p className="text-gray-600">{orderData.address.complement}</p>
                )}
                <p className="text-gray-600">
                    {orderData.address?.district} - {orderData.address?.city}/{orderData.address?.state}
                </p>
                <p className="text-gray-600">CEP: {orderData.address?.zipCode}</p>
            </div>

            {/* Itens */}
            <div className="mb-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                            <th className="py-2">Item</th>
                            <th className="py-2 text-center">Qtd</th>
                            <th className="py-2 text-right">Preço</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {orderData.items.map((item: any) => (
                            <tr key={item.id} className="border-b border-gray-100">
                                <td className="py-3">
                                    <span className="font-medium block">{item.variant.product.name}</span>
                                    <span className="text-gray-500 text-xs">
                                        {/* Verificação segura de propriedades opcionais */}
                                        {item.variant.color?.name ? `Cor: ${item.variant.color.name}` : ''}
                                        {item.variant.color?.name && item.variant.size ? ' / ' : ''}
                                        {item.variant.size ? `Tam: ${item.variant.size}` : ''}
                                    </span>
                                </td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">{formatCurrency(item.price / 100)}</td>
                                <td className="py-3 text-right font-medium">{formatCurrency((item.price * item.quantity) / 100)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totais */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(orderData.amount / 100)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-black pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(orderData.totalAmount / 100)}</span>
                    </div>
                </div>
            </div>

            {/* Rodapé / Assinatura */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300 text-center">
                <div className="flex justify-between items-end px-8 mb-4">
                    <div className="text-center w-1/3">
                        <div className="border-b border-gray-400 h-8 mb-2"></div>
                        <p className="text-xs text-gray-500">Assinatura do Entregador</p>
                    </div>
                    <div className="text-center w-1/3">
                        <div className="border-b border-gray-400 h-8 mb-2"></div>
                        <p className="text-xs text-gray-500">Assinatura do Cliente</p>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-8">FoxFit E-commerce - Recibo gerado automaticamente</p>
            </div>

            {/* Botão de Imprimir (Apenas na tela) */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <PrintButton />
            </div>
        </div>
    );
}
