"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { removeCartItem, updateCartItem } from "@/lib/action";

type CartItem = {
  sku: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  lineTotal: number;
};

export function ShoppingCart({ cartItems }: { cartItems: CartItem[] }) {
  const [isPending, startTransition] = useTransition();

  const subtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

  function handleUpdateQuantity(sku: string, newQuantity: number) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("sku", sku);
      formData.append("quantity", String(newQuantity));
      const result = await updateCartItem(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex-grow overflow-y-auto -mx-6">
        <div className="px-6 flex flex-col gap-y-8">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Sua sacola está vazia.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.sku} className="flex gap-x-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Tamanho: {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      R${item.price.toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex items-center gap-x-2 border rounded-md px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.sku, item.quantity - 1)}
                        disabled={isPending}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.sku, item.quantity + 1)}
                        disabled={isPending}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <form action={removeCartItem}>
                  <input type="hidden" name="sku" value={item.sku} />
                  <Button variant="ghost" size="icon" className="self-start" disabled={isPending}>
                    <Trash2 size={16} />
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">Subtotal</p>
          <p className="font-semibold">
            R${subtotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <Link href="/order-review" passHref>
          <Button className="w-full mt-4 bg-[#5131E8] hover:bg-[#5131E8]/90">
            Finalizar a compra
          </Button>
        </Link>
        <Button variant="link" className="w-full mt-2 text-center text-black">
          Continuar comprando
        </Button>
      </div>
    </>
  );
}