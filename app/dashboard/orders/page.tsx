import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Função para buscar os pedidos paginados
async function getData({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize;

  const [data, totalOrders] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        address: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        shipment: { // Include the shipment relation
          select: {
            shippingLabelUrl: true, // Select shippingLabelUrl from shipment
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip,
      take: pageSize,
    }),
    prisma.order.count(),
  ]);

  const formattedData = data.map(order => ({
    id: order.id,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
    user: order.address.user,
    shippingLabelUrl: order.shipment?.shippingLabelUrl, // Passar a URL para o componente do shipment
  }));

  return {
    data: formattedData,
    totalPages: Math.ceil(totalOrders / pageSize),
  };
}

// O componente da página agora aceita searchParams para a paginação
export default async function OrdersPage({ searchParams }: { searchParams?: { page?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const { data, totalPages } = await getData({ page: currentPage });

  return (
    <Card className="px-7">
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
        <CardDescription>Pedidos recentes da sua loja!</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium">{item.user?.firstName} {item.user?.lastName}</p>
                  <p className="text-muted-foreground hidden text-sm md:flex">
                    {item.user?.email}
                  </p>
                </TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(item.createdAt))}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm" disabled={!item.shippingLabelUrl}>
                    <Link href={item.shippingLabelUrl || ''} target="_blank">
                      Imprimir Etiqueta
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.amount / 100)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </CardContent>
    </Card>
  );
}

// Componente de Paginação
function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <Button asChild variant="outline" disabled={currentPage <= 1}>
        <Link href={`?page=${currentPage - 1}`}>Anterior</Link>
      </Button>
      
      <span className="text-sm font-medium">
        Página {currentPage} de {totalPages}
      </span>

      <Button asChild variant="outline" disabled={currentPage >= totalPages}>
        <Link href={`?page=${currentPage + 1}`}>Próximo</Link>
      </Button>
    </div>
  );
}