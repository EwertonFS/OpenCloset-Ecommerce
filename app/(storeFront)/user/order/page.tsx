import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Função para formatar preço para BRL
const formatPrice = (priceInCents: number) => {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// Função para formatar data
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Mapa de status para cores e textos
const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "text-yellow-700", bg: "bg-yellow-100" },
  paid: { label: "Pago", color: "text-green-700", bg: "bg-green-100" },
  shipped: { label: "Enviado", color: "text-blue-700", bg: "bg-blue-100" },
  delivered: { label: "Entregue", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100" },
};

// Função para buscar os pedidos do usuário no servidor
async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      address: {
        userId: userId,
      },
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              color: true,
            },
          },
        },
      },
      shipment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return orders;
}

export default async function MyOrdersPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/user/order");
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Você ainda não fez nenhum pedido</h2>
          <p className="text-gray-500 mt-2 mb-6">Explore nossa loja e encontre o que você procura.</p>
          <Button asChild>
            <Link href="/">Começar a comprar</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || { label: order.status, color: "text-gray-700", bg: "bg-gray-100" };

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Header: Pedido # e Status */}
                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Pedido #{order.id.substring(0, 8).toUpperCase()}
                  </h3>
                  <Badge className={`${statusInfo.bg} ${statusInfo.color} hover:${statusInfo.bg} px-3 py-1 text-sm font-medium rounded-md border-0`}>
                    Status: {statusInfo.label}
                  </Badge>
                </div>

                {/* Info Row: Data e Total */}
                <div className="px-6 py-3 border-t border-b border-gray-100 flex justify-between items-center bg-gray-50/30 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-500">Data: </span>
                    <span className="font-semibold text-gray-700">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Total: </span>
                    <span className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Items e Botão */}
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Lista de Produtos (Horizontal) */}
                  <div className="flex-1 flex gap-6 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 min-w-[200px]">
                        <div className="relative w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image
                            src={item.variant.product.images[0]}
                            alt={item.variant.product.name}
                            fill
                            className="object-cover"
                            sizes="100px"
                            quality={90}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-800 line-clamp-2 mb-1" title={item.variant.product.name}>
                            {item.variant.product.name}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Cor: {item.variant.color.name}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Tamanho: {item.variant.size}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Qtd: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão  */}
                  {/* <div className="flex-shrink-0 w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      Ver Detalhes
                    </Button>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}