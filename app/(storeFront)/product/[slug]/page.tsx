import Image from "next/image";
import { prisma } from "@/lib/prisma"; // Import prisma client
import { notFound } from "next/navigation"; // Import notFound for handling missing products
import { ProductView } from "./ProductView";
interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params: initialParams }: ProductPageProps) {
  const params = await initialParams;
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      variants: {
        include: {
          inventory: true, // Inclui o inventário de cada variante
          color: true,
        },
      },
    },
 })
  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white text-black mx-auto"> {/* mx-auto is removed here */}
      <div className="mx-auto px-4 sm:px-6 lg:px-11">
        <ProductView product={product} />

          {/* Dados Mockados */}
        <div className="my-24">
          <h2 className="text-2xl font-bold text-center">Você também pode gostar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* Related Product 1 */}
            <div className="text-center">
              <Image
                src="/related-1.png"
                alt="Related Product 1"
                width={400}
                height={520}
                className="rounded-lg mx-auto"
              />
              <h3 className="font-semibold mt-4">Nike Therma FIT Headed</h3>
              <p className="text-gray-500">Men’s Fleece Shacket</p>
              <p className="font-bold mt-2">R$490</p>
            </div>
            {/* Related Product 2 */}
            <div className="text-center">
              <Image
                src="/related-2.png"
                alt="Related Product 2"
                width={400}
                height={520}
                className="rounded-lg mx-auto"
              />
              <h3 className="font-semibold mt-4">Nike Therma FIT Headed</h3>
              <p className="text-gray-500">Men’s Fleece Shacket</p>
              <p className="font-bold mt-2">R$490</p>
            </div>
            {/* Related Product 3 */}

            <div className="text-center">
              <Image
                src="/related-3.png"
                alt="Related Product 3"
                width={400}
                height={520}
                className="rounded-lg mx-auto"
              />
              <h3 className="font-semibold mt-4">Nike Therma FIT Headed</h3>
              <p className="text-gray-500">Men’s Fleece Shacket</p>
              <p className="font-bold mt-2">R$749</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}