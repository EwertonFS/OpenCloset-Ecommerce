import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getUserFavorites } from "@/lib/action";
import { ProductCard } from "@/app/components/ProductCard";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        redirect("/api/auth/login");
    }

    const favorites = await getUserFavorites(user.id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Meus Favoritos</h1>

            {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Sua lista de favoritos está vazia</h2>
                    <p className="text-gray-500 mt-2 mb-6">Salve os produtos que você ama para ver mais tarde.</p>
                    <Button asChild>
                        <Link href="/">Explorar produtos</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
