// import Image from "next/image";
// import Link from "next/link";
// import { type ProductWithCategory } from "@/lib/types";
// import { formatCurrency } from "@/app/helpers";
// import { FavoriteButton } from "@/app/components/FavoriteButton";

// interface ProductCardProps {
//   products: ProductWithCategory[];
// }

// const ProductCard = ({ products }: ProductCardProps) => {
//   if (products.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
//         <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros</p>
//       </div>
//     );
//   }
//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
//       {products.map((product) => (
//         <div key={product.id} className="group relative">
//           <Link href={`/product/${product.slug}`}>
//             <div className="text-center cursor-pointer">
//               <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[400px] bg-[#F1F1F1] rounded-xl lg:rounded-2xl overflow-hidden">
//                 <Image
//                   src={product.images[0]}
//                   alt={product.name}
//                   fill
//                   className="object-cover rounded-xl lg:rounded-2xl transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <h3 className="font-semibold mt-3 sm:mt-4 text-sm sm:text-base line-clamp-2">{product.name}</h3>
//               <p className="text-gray-500 text-xs sm:text-sm mt-1">
//                 {product.category.parent
//                   ? `${product.category.parent.name} > ${product.category.name}`
//                   : product.category.name}
//               </p>
//               <p className="font-bold mt-2 text-sm sm:text-base">
//                 {formatCurrency(product.price)}
//               </p>
//             </div>
//           </Link>
//           <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
//             <FavoriteButton productId={product.id} />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProductCard;