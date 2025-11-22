
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Package, Heart } from "lucide-react";

const links = [
    { href: "/user", label: "Minha Conta", icon: User },
    { href: "/user/address-book", label: "Endereços", icon: MapPin },
    { href: "/user/order", label: "Meus Pedidos", icon: Package },
    { href: "/user/favorites", label: "Favoritos", icon: Heart },
];

export default function UserSidebar({ user }: { user: KindeUser | null }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 p-4 border-r hidden lg:block">
            {user && (
                <div className="flex flex-col items-center gap-2 mb-8">
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
                <ul className="space-y-2">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}>
                                <div className={`flex items-center gap-3 p-2 rounded-md transition-colors ${pathname === link.href ? 'bg-gray-100 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <link.icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
