
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const links = [
    { href: "/user", label: "Minha Conta" },
    { href: "/user/address-book", label: "Endereços" },
    { href: "/user/order", label: "Meus Pedidos" },
    { href: "/user/favorites", label: "Favoritos" },
    { href: "/user/personal", label: "Dados Pessoais" },
];

export default function UserSidebar({ user }: { user: KindeUser | null }) {
    const pathname = usePathname();
  
    return (
        <aside className="w-64 p-4 border-r">
            {user && (
              <div className="flex items-center gap-2 mb-8">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.picture ?? undefined} alt="User avatar" />
                    <AvatarFallback>{user.given_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{`${user.given_name} ${user.family_name}`}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>      
            )}
            <nav>
                <ul>
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}>
                                <p className={`p-2 rounded-md ${pathname === link.href ? 'bg-gray-200' : ''}`}>
                                    {link.label}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
