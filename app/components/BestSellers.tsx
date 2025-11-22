import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "../helpers";
import { FavoriteButton } from "./FavoriteButton";

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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-11">
        {products.map((product) => (
          <div key={product.id} className="relative group">
            <Link href={`/product/${product.slug}`}>
              <div className="flex flex-col gap-4 md:gap-6 cursor-pointer">
                <div className="w-full h-[250px] md:h-[400px] bg-[#EFF1F3] rounded-2xl md:rounded-3xl overflow-hidden relative">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2 md:gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm md:text-base leading-5 text-black line-clamp-1">
                      {product.name}
                    </p>
                    <p className="font-medium text-xs md:text-base leading-5 text-gray-500">
                      {product.category.name}
                    </p>
                  </div>
                  <p className="font-semibold text-sm md:text-base leading-5 text-black">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            </Link>
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton productId={product.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;