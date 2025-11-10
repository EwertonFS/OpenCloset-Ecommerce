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
import { NavbarLinks } from "./navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CartWrapperProps {
  cartCount?: number;
}

export function Header({ children, cartCount }: { children: React.ReactElement<CartWrapperProps>, cartCount: number }) {
  const { isAuthenticated, user } = useKindeBrowserClient();

  return (
    <>
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-11 py-8">
       
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">FoxFit</h1>
          <Image
            src="/icons/registered.svg"
            alt="Registered"
            width={10}
            height={10}
          />
            {/* LINKS */}
           <NavbarLinks/>
        </div>
      
        <div className="flex items-center gap-2">
       
        {/* BUSCA */}
        <div className="flex items-center gap-4">
          {/* <Image src="/icons/search.svg" alt="Search" width={24} height={24} /> */}
          {React.cloneElement(children, { cartCount })}
        </div>

         {/* USUARIO */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Image src={user?.picture || "/icons/user.svg"} alt={user?.given_name || "User"} width={24} height={24} className="rounded-full" />
                  <span>Olá, {user?.given_name || user?.email}!</span>
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
            <div className="flex items-center gap-2">
              <LoginLink className="text-blue-500 hover:underline">
                Entrar
              </LoginLink>
              <RegisterLink className="text-blue-500 hover:underline">
                Registrar
              </RegisterLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
