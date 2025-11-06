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
  DropdownMenuSeparator,
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

async function getData() {
  const data = await prisma.banner.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return data;
}

const BannerRoute = async () => {
  const data = await getData();

//   const data = [
//   {
//     id: 'banner_001',
//     imageString: '/banner-01.png', // Assuming a placeholder image
//     title: 'Nova Coleção de Verão',
//     createdAt: new Date('2025-09-18T08:00:00Z'),
//   },
//   {
//     id: 'banner_002',
//     imageString: '/banner.desktop.png', // Assuming a placeholder image
//     title: 'Promoção de Lançamento',
//     createdAt: new Date('2025-09-17T12:00:00Z'),
//   },
//   {
//     id: 'banner_003',
//     imageString: '/promo-1.png', // Assuming a placeholder image
//     title: 'Frete Grátis para todo o Brasil',
//     createdAt: new Date('2025-09-16T10:00:00Z'),
//   },
// ];

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Link href={'/dashboard/banner/create'} passHref>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Banner</span>
          </Button>
        </Link>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Banners</CardTitle>
          <CardDescription>Manage your banners</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Image
                      src={banner.imageString}
                      alt={banner.title}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover h-16 w-16"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell className="text-end">
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
                          <Link href={`/dashboard/banner/${banner.id}/delete`}>
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

export default BannerRoute;
