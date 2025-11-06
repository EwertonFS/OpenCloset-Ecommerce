import Image from "next/image";
import Link from "next/link";
import { type ProductWithCategory } from "@/lib/action";
import { formatCurrency } from "@/app/helpers";

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
          <Link href={`/product/${product.slug}`} key={product.id}>
            <div className="text-center cursor-pointer">
              <div className="relative w-full h-[400px] bg-[#F1F1F1] rounded-2xl">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-2xl"
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
        ))}
      </div>
  );
};

export default ProductCard;