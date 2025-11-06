import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: "Nike Therma FIT Headed",
    category: "Men’s Fleece Shacket",
    price: 490,
    image: "/related-1.png",
  },
  {
    name: "Nike Therma FIT Headed",
    category: "Men’s Fleece Shacket",
    price: 365,
    image: "/related-2.png",
  },
  {
    name: "Nike Therma FIT Headed",
    category: "Men’s Fleece Shacket",
    price: 490,
    image: "/related-3.png",
  },
  {
    name: "Nike Therma FIT Headed",
    category: "Men’s Fleece Shacket",
    price: 749,
    image: "/bestseller-4.png",
  },
];

export function NewArrivals() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Você também pode gostar</h2>
        <Link href="#" className="text-md font-semibold flex items-center gap-1">
          Ver todos
          <Image src="/icons/chevron-right.svg" alt="" width={16} height={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div key={index} className="flex flex-col gap-y-4">
            <div className="relative w-full h-[400px] bg-[#F1F1F1] rounded-2xl">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-2xl"
              />
            </div>
            <div className="flex flex-col gap-y-2">
                <h3 className="font-medium text-lg">{product.name}</h3>
                <p className="text-gray-500 text-md">{product.category}</p>
                <p className="font-semibold text-lg">R${product.price.toFixed(2).replace(".", ",")}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
