import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
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
              product: true, // Inclui os detalhes do produto
              color: true,   // Inclui os detalhes da cor
            },
          },
        },
      },
      shipment: true, // Inclui os detalhes do envio
    },
    orderBy: {
      createdAt: 'desc', // Ordena pelos mais recentes
    },
  });
  return orders;
}

// A página de pedidos agora é um Server Component assíncrono
export default async function MyOrdersPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Se não houver usuário, redireciona para o login
  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/user/order");
  }

  // Busca os pedidos
  const orders = await getUserOrders(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold">Você ainda não fez nenhum pedido.</h2>
          <p className="text-gray-500 mt-2">Quando fizer, eles aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                    <p className="font-semibold text-sm">PEDIDO REALIZADO</p>
                    <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                    <p className="font-semibold text-sm text-right">TOTAL</p>
                    <p className="text-xs text-gray-600 text-right">{formatPrice(order.totalAmount)}</p>
                </div>
                <div className="hidden md:block">
                    <p className="font-semibold text-sm">PEDIDO Nº</p>
                    <p className="text-xs text-gray-600">#{order.id.substring(0, 8)}</p>
                </div>
                {order.shipment?.trackingCode && (
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm">RASTREIO JADLOG</p>
                        <a 
                            href="https://www.jadlog.com.br/tracking" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {order.shipment.trackingCode}
                        </a>
                    </div>
                )}
                {order.shipment?.trackingCode && (
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm">RASTREIO JADLOG</p>
                        <a 
                            href="https://www.jadlog.com.br/tracking" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {order.shipment.trackingCode}
                        </a>
                    </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-24 h-24 relative bg-gray-100 rounded-md overflow-hidden">
                        <Image 
                            src={item.variant.product.images[0]} 
                            alt={item.variant.product.name} 
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.variant.product.name}</p>
                      <p className="text-sm text-gray-500">Cor: {item.variant.color.name}</p>
                      <p className="text-sm text-gray-500">Tamanho: {item.variant.size}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}