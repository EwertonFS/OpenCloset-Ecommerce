import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./ProductCard";

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: "published",
    },
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
      slug: true,
      category: {
        select: {
          name: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 4, // Let's keep it to 4 products as in the original component
  });
  return products;
}

const BestSellers = async () => {
  const products = await getFeaturedProducts();
  console.log(products);

  return (
    <div className="flex flex-col gap-9 pb-16">
      <div className="flex items-center justify-between px-11">
        <h2 className="font-semibold text-2xl leading-9">Produtos em Destaque</h2>
        <div className="flex items-center gap-2.5">
          <Link href="/products">
            <p className="font-semibold text-base leading-6 hover:underline">Ver todos</p>
          </Link>
          <Image
            src="/icons/chevron-right.svg"
            alt="Ver todos"
            width={20}
            height={20}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-11">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSellers;