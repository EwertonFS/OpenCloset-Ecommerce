"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "../helpers";
import { FavoriteButton } from "./FavoriteButton";
import { SubmitButton } from "./SubmitButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        images: string[];
        price: number;
        slug: string;
        category: {
            name: string;
            parent?: {
                name: string;
            } | null;
        };
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const handleNavigate = () => {
        setIsLoading(true);
        router.push(`/product/${product.slug}`);
    };

    const categoryName = product.category.parent
        ? `${product.category.parent.name} - ${product.category.name}`
        : product.category.name;

    return (
        <div className="relative group flex flex-col gap-4 w-full">
            <div className="relative w-full aspect-[3/4] bg-[#EFF1F3] rounded-2xl md:rounded-3xl overflow-hidden">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {product.images.map((image, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                                <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arrows - Only show on hover on desktop, always visible or subtle on mobile if needed, but hover is fine */}
                {product.images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 md:p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-sm"
                        >
                            <ChevronLeft size={18} className="md:w-5 md:h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 md:p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-20 shadow-sm"
                        >
                            <ChevronRight size={18} className="md:w-5 md:h-5" />
                        </button>
                    </>
                )}

                {/* Favorite Button */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                    <FavoriteButton productId={product.id} className="w-8 h-8 md:w-10 md:h-10" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                        <Link href={`/product/${product.slug}`}>
                            <h3 className="font-bold text-base md:text-lg leading-tight text-black line-clamp-1 hover:underline truncate">
                                {product.name}
                            </h3>
                        </Link>
                        <p className="font-medium text-[10px] md:text-sm leading-tight text-gray-500 line-clamp-1">
                            {categoryName}
                        </p>
                    </div>
                    {/* Price Badge */}
                    <div className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm whitespace-nowrap shrink-0">
                        {formatCurrency(product.price)}
                    </div>
                </div>

                {/* Saiba Mais Button */}
                <div className="w-full">
                    <SubmitButton
                        onClick={handleNavigate}
                        isLoading={isLoading}
                        type="button"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg md:rounded-xl h-9 md:h-10 text-sm md:text-base mt-1 md:mt-2"
                    >
                        Saiba Mais!
                    </SubmitButton>
                </div>
            </div>
        </div>
    );
}
