import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditForm } from '../../components/dashboard/EditForm';

export default async function EditRoute({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      price: true,
      images: true,
      isFeatured: true,
      slug: true,
      dimensions: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      variants: {
        select: {
          id: true,
          price: true,
          sku: true,
          size: true,
          color: {
            select: {
              name: true,
            },
          },
          inventory: {
            select: {
              id: true,
              quantity: true,
            },
          },
          imageUrl: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }
  
  const categories = await prisma.category.findMany({
    include: {
      children: true,
    },
  });

  const productData = {
    ...product,
    category: product.category.id,
    variants: product.variants.map((variant) => ({
      ...variant,
      color: variant.color.name,
      quantity: variant.inventory?.quantity || 0,
      imageUrl: variant.imageUrl || undefined,
    })),
  };

  return <EditForm data={productData} categories={categories} />;
}