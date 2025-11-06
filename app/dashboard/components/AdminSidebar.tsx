'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2, Home, ShoppingCart, Package, Users } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/orders", icon: ShoppingCart, label: "Pedidos" },
    { href: "/products", icon: Package, label: "Produtos" },
    { href: "/categories", icon: Users, label: "Categorias" }, // Using Users icon for Categories for now
  ];

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">ACME Admin</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === link.href ? "bg-muted text-primary" : ""}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function AdminMobileSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/orders", icon: ShoppingCart, label: "Pedidos" },
    { href: "/products", icon: Package, label: "Produtos" },
    { href: "/categories", icon: Users, label: "Categorias" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Home className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">ACME Admin</span>
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${pathname === link.href ? "bg-muted text-foreground" : ""}`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
