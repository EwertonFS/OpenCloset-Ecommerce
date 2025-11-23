import { getCart, removeCartItem } from "@/lib/action";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export async function Cart() {
  const cartItems = await getCart();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-[90vw]">
        <SheetHeader>
          <SheetTitle>Minha Sacola</SheetTitle>
        </SheetHeader>

        <div className="h-full flex flex-col justify-between">
          <div className="mt-8 flex-1 overflow-y-auto">
            <ul className="-my-6 divide-y divide-gray-200">
              {cartItems.length === 0 ? (
                <h1 className="py-6">Sua sacola está vazia.</h1>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <li key={item.sku} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">
                              R${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Tamanho: {item.size}
                          </p>
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qtd: {item.quantity}</p>

                          <div className="flex">
                            <form action={removeCartItem}>
                              <input type="hidden" name="sku" value={item.sku} />
                              <button
                                type="submit"
                                className="font-medium text-primary hover:text-primary/80"
                              >
                                Remover
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>R${subtotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Frete e taxas serão calculados no checkout.</p>
            <div className="mt-6">
              <Button className="w-full">Finalizar Compra</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}