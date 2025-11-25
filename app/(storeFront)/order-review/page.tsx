import Image from "next/image";

import { NewArrivals } from "@/app/components/NewArrivals";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getCart } from "@/lib/action";
import { formatCurrency } from "@/app/helpers";
import { ContinueButton } from "@/app/components/ContinueButton";

export default async function OrderReviewPage() {
  const cartItems = await getCart();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.lineTotal,
    0
  );
  const shipping = 0; // Frete grátis, conforme o design
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* <CheckoutSteps currentStep="identification" /> */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12">
        {/* Coluna da Sacola */}
        <div className="lg:col-span-7 bg-white p-8 border border-gray-200 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-6">Sacola</h2>
          <div className="flex flex-col gap-y-8">
            {cartItems.map((item) => (
              <div key={item.sku} className="flex gap-x-4">
                <div className="relative w-32 h-32 bg-gray-100 rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Tamanho: {item.size}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="font-semibold text-lg">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center gap-x-3 border rounded-md px-3 py-1.5">
                      <button>
                        <Trash2 size={16} className="text-gray-600" />
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button>
                        <Plus size={16} />
                      </button>
                    </div>

                  </div>
                  <div className="flex-col items-start gap-1.5 justify-stretch">
                    <Separator />
                  </div>

                </div>

              </div>

            ))}
          </div>
        </div>

        {/* Coluna do Resumo */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 border border-gray-200 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-6">Resumo</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transporte e Manuseio</span>
                <span className="font-medium">{shipping === 0 ? "—" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa Estimada</span>
                <span className="font-medium">—</span>
              </div>
              <div className="border-t my-4"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <ContinueButton href="/order-review/identification" />
          </div>
        </div>
      </div>

      {/* Seção "Você também pode gostar" */}
      <div className="mt-16">
        <NewArrivals />
      </div>
    </div>
  );
}
