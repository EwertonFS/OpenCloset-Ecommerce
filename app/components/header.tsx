"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import React, { type ReactNode } from "react";
import { NavbarLinks, navbarlinks } from "./navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface CartWrapperProps {
  cartCount?: number;
}

export function Header({ children, cartCount }: { children: React.ReactElement<CartWrapperProps>, cartCount: number }) {
  const { isAuthenticated, user } = useKindeBrowserClient();

  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-11 py-4 md:py-8">

        {/* LOGO & DESKTOP NAV */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navbarlinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-4xl font-bold">FoxFit</h1>
              <Image
                src="/icons/registered.svg"
                alt="Registered"
                width={10}
                height={10}
                className="mb-auto"
              />
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:block">
            <NavbarLinks />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">

          {/* BUSCA / CART */}
          <div className="flex items-center gap-2 md:gap-4">
            {React.cloneElement(children, { cartCount })}
          </div>

          {/* USUARIO */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-4">
                  <Image
                    src={user?.picture || "/icons/user.svg"}
                    alt={user?.given_name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full h-6 w-6 md:h-8 md:w-8"
                  />
                  <span className="hidden md:inline text-sm font-medium">
                    Olá, {user?.given_name || user?.email?.split('@')[0]}!
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/user">Minha Conta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/order">Meus Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/address-book">Endereços</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/favorites">Meus Favoritos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogoutLink className="w-full">
                    Sair
                  </LogoutLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <LoginLink className="text-sm font-medium hover:underline">
                Entrar
              </LoginLink>
              <span className="text-gray-300">|</span>
              <RegisterLink className="text-sm font-medium hover:underline">
                Registrar
              </RegisterLink>
            </div>
          )}

          {/* MOBILE LOGIN ICON (if not authenticated) */}
          {!isAuthenticated && (
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <LoginLink>
                <Image src="/icons/user.svg" alt="Login" width={24} height={24} />
              </LoginLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
