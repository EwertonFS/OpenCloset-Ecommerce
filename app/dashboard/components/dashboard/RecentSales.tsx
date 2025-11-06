import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

async function getData() {
  const data = await prisma.order.findMany({
    select: {
      id: true,
      amount: true,
      address: { // Acessa o endereço ligado ao pedido
        select: {
          user: { // Acessa o usuário ligado ao endereço
            select: {
              firstName: true,
              profileImage: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 7, // Pega as 7 vendas mais recentes
  });

  // Transforma os dados para o formato que o componente da tabela espera
  const formattedData = data.map(order => ({
    id: order.id,
    amount: order.amount,
    user: order.address.user
  }));

  return formattedData;
}

const RecentSales = async () => {
  const data = await getData();


  //     const data = [
//   {
//     id: 'sale_001',
//     amount: 15000, // R$ 150.00
//     user: {
//       firstName: 'Alice',
//       profileImage: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alice',
//       email: 'alice.smith@example.com',
//     },
//   },
//   {
//     id: 'sale_002',
//     amount: 7500, // R$ 75.00
//     user: {
//       firstName: 'Bob',
//       profileImage: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bob',
//       email: 'bob.johnson@example.com',
//     },
//   },
//   {
//     id: 'sale_003',
//     amount: 20000, // R$ 200.00
//     user: {
//       firstName: 'Charlie',
//       profileImage: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie',
//       email: 'charlie.brown@example.com',
//     },
//   },
//   {
//     id: 'sale_004',
//     amount: 12000, // R$ 120.00
//     user: {
//       firstName: 'Diana',
//       profileImage: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Diana',
//       email: 'diana.prince@example.com',
//     },
//   },
//   {
//     id: 'sale_005',
//     amount: 9000, // R$ 90.00
//     user: {
//       firstName: 'Eve',
//       profileImage: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Eve',
//       email: 'eve.adams@example.com',
//     },
//   },
//   {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9 sm:flex">
              <AvatarImage src={item.user?.profileImage || ''} />
              <AvatarFallback>
                {item.user?.firstName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium">{item.user?.firstName}</p>
              <p className="text-muted-foreground text-xs">
                {item.user?.email}
              </p>
            </div>
            <p className="ml-auto font-medium">
              +
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.amount / 100)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentSales;