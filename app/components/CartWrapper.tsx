"use client";

import { useState, type ReactNode } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CartWrapper({ children, cartCount }: { children: ReactNode, cartCount?: number }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Image
            src="/icons/shopping-bag.svg"
            alt="Shopping Bag"
            width={24}
            height={24}
          />
          {cartCount !== undefined && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      {children}
    </Sheet>
  );
}
