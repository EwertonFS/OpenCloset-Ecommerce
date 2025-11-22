"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite, checkIsFavorite } from "@/lib/action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    productId: string;
    className?: string;
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await checkIsFavorite(productId);
                setIsFavorite(status);
            } catch (error) {
                console.error("Failed to check favorite status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [productId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();

        // Optimistic update
        const previousState = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            const result = await toggleFavorite(productId);
            if (result.error) {
                setIsFavorite(previousState); // Revert on error
                toast.error(result.error);
            } else {
                if (result.isFavorite) {
                    toast.success("Adicionado aos favoritos");
                } else {
                    toast.success("Removido dos favoritos");
                }
            }
        } catch (error) {
            setIsFavorite(previousState);
            toast.error("Erro ao atualizar favoritos");
        }
    };

    if (isLoading) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50", className)}
                disabled
            >
                <Heart className="w-5 h-5 text-gray-300" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn("rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50 transition-all hover:scale-110 active:scale-95", className)}
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-colors",
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
                )}
            />
        </Button>
    );
}
