// Este será o Server Component que busca os dados

import { getCart } from "@/lib/action";
import { ShoppingCart } from "./ShoppingCart";

import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export async function ShoppingCartSheet() {
  const cartItems = await getCart();
  return (
    <SheetContent className="w-[90vw] max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Sacola</SheetTitle>
        </SheetHeader>
        <ShoppingCart cartItems={cartItems} />
    </SheetContent>
  );
}
