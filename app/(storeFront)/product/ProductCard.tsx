import Image from "next/image";
import Link from "next/link";
import { type ProductWithCategory } from "@/lib/types";
import { formatCurrency } from "@/app/helpers";
import { FavoriteButton } from "@/app/components/FavoriteButton";

interface ProductCardProps {
  products: ProductWithCategory[];
}

const ProductCard = ({ products }: ProductCardProps) => {
  if (products.length === 0) {
    return <p className="text-center col-span-full">Nenhum produto encontrado.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div key={product.id} className="group relative">
          <Link href={`/product/${product.slug}`}>
            <div className="text-center cursor-pointer">
              <div className="relative w-full h-[400px] bg-[#F1F1F1] rounded-2xl overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="font-semibold mt-4">{product.name}</h3>
              <p className="text-gray-500">
                {product.category.parent
                  ? `${product.category.parent.name} > ${product.category.name}`
                  : product.category.name}
              </p>
              <p className="font-bold mt-2">
                {formatCurrency(product.price)}
              </p>
            </div>
          </Link>
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;