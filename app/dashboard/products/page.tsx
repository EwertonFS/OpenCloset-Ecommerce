import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getData() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true,
      variants: {
        include: {
          inventory: true,
          stockMovements: true, // Fetch all movements
        },
      },
    },
  });

  return products.map(product => {
    const totalQuantity = product.variants.reduce((sum, variant) => {
      return sum + (variant.inventory?.quantity || 0);
    }, 0);

    const initialStock = product.variants.reduce((sum, variant) => {
      const initialMovement = variant.stockMovements.find(m => m.notes === 'Estoque inicial');
      return sum + (initialMovement?.quantity || 0);
    }, 0);

    const itemsSold = product.variants.reduce((sum, variant) => {
      const soldMovements = variant.stockMovements.filter(m => m.type === 'OUT');
      const soldQuantity = soldMovements.reduce((s, move) => s + move.quantity, 0);
      return sum + soldQuantity;
    }, 0);

    return {
      ...product,
      totalQuantity, // Estoque Atual
      initialStock, // Estoque Inicial
      itemsSold, // Itens Vendidos
    };
  });
}

const ProductsRoute = async () => {
  const data = await getData();
  console.log(data);
  return (
    <>
      <div className="flex items-center justify-end">
        <Button asChild className="flex items-center gap-x-2">
          <Link href={'/dashboard/products/create'}>
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Adicionar Produto</span>
          </Link>
        </Button>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle suppressHydrationWarning>Produtos</CardTitle>
          <CardDescription suppressHydrationWarning>
            Gerencie seus produtos e veja o desempenho de vendas{' '}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço Base</TableHead>
                <TableHead>Estoque Inicial</TableHead>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Itens Vendidos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      alt="product Image"
                      src={item.images[0]}
                      width={64}
                      height={64}
                      className="rounded-md object-cover h-16 w-16"
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.isFeatured ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.initialStock}</TableCell>
                  <TableCell>
                    {item.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{item.totalQuantity}</TableCell>
                  <TableCell>{item.itemsSold}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${item.id}`}>
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${item.id}/delete`}>
                            Excluir
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductsRoute;