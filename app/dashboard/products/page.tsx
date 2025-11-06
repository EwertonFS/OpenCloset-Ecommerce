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
import { MoreHorizontal, PlusCircle, UserIcon } from 'lucide-react';
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
        },
      },
    },
  });

  return products.map(product => {
    let totalQuantity = 0;
    if (product.variants.length === 0) {
      totalQuantity = 1; // Default quantity for products without variants
    } else {
      totalQuantity = product.variants.reduce((sum, variant) => {
        return sum + (variant.inventory?.quantity || 0);
      }, 0);
    }
    return {
      ...product,
      totalQuantity,
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
            <span>Add Product</span>
          </Link>
        </Button>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your products and view their sales performace{' '}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>PreçoBase</TableHead>
                <TableHead>QTD.Adcionada</TableHead>
                <TableHead>EstoqueReal</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
         
              <TableBody>
                  {data.map((item) => (
                <TableRow  key={item.id}>
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
                  <TableCell>{item.totalQuantity}</TableCell>
                  <TableCell>{item.totalQuantity}</TableCell>{/* mostra estoque atual decrementado pela vendas */}
                  <TableCell>
                    {item.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${item.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${item.id}/delete`}>
                            Delete
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