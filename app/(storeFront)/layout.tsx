import { Header } from "@/app/components/header";

import { CartWrapper } from "@/app/components/CartWrapper";
import { ShoppingCartSheet } from "@/app/components/ShoppingCartSheet";
import { getCart } from "@/lib/action";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <>
      <Header cartCount={cartCount}>
        <CartWrapper>
          <ShoppingCartSheet />
        </CartWrapper>
      </Header>
   
      <main >{children}</main>
    </>
  );
}