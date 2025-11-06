import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "../helpers";

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
        },
      },
    },
    take: 4, // Let's keep it to 4 products as in the original component
  });
  return products;
}

const BestSellers = async () => {
  const products = await getFeaturedProducts();
  // console.log(products);

  return (
    <div className="flex flex-col gap-9 pb-16">
      <div className="flex items-center justify-between px-11">
        <h2 className="font-semibold text-2xl leading-9">Produtos em Destaque</h2>
        <div className="flex items-center gap-2.5">
          <p className="font-semibold text-base leading-6">Ver todos</p>
          <Image
            src="/icons/chevron-right.svg"
            alt="Ver todos"
            width={20}
            height={20}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 px-11">
        {products.map((product) => (
          <Link href={`/product/${product.slug}`} key={product.id}>
            <div className="flex flex-col gap-6 cursor-pointer">
              <div className="w-full h-[400px] bg-[#EFF1F3] rounded-3xl">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-base leading-5 text-black">
                    {product.name}
                  </p>
                  <p className="font-medium text-base leading-5 text-gray-500">
                    {product.category.name}
                  </p>
                </div>
                <p className="font-semibold text-base leading-5 text-black">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;