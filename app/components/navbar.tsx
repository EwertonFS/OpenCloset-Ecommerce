'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// import { prisma } from "@/lib/prisma";
  export const navbarlinks = [
  { id: 0, name: 'Home', href: '/' },
  { id: 1, name: 'All Products', href: '/productList' },
  // { id: 2, name: 'Mulher', href: '/products/women' },
];

export function NavbarLinks() {

  const location = usePathname();

  // const categories = await prisma.category.findMany({
  //   select: {
  //     id: true,
  //     name: true,
  //   },
  // });



  return (
    <nav className="flex justify-center items-center py-4">
      <ul className="flex gap-8">
        <li>
         {navbarlinks.map((item) => (
           <Link
           key={item.id}
            href={item.href}
            className={cn(
            location === item.href
              ? 'bg-muted'
              : 'hover:bg-muted hover:backdrop-opacity-75',
            'group rounded-md p-2 font-medium',
          )}
    
          >
         {item.name}
          </Link>
         ))}
        </li>
        {/* {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/productList?category=${category.name}`}
              className="text-gray-500 font-medium text-base"
            >
              {category.name}
            </Link>
          </li>
        ))} */}
      </ul>
    </nav>
  );
}
