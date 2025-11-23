// app/(storeFront)/product/[slug]/ProductForm.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { Prisma } from "@prisma/client";
import { AddCartItem } from "@/lib/action";
import { SizeSelector } from "./SizeSelector";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/app/helpers";

type ProductWithVariants = Prisma.ProductGetPayload<{
  include: {
    variants: {
      include: {
        inventory: true;
        color: true;
      };
    };
  };
}>;

interface ProductFormProps {
  product: ProductWithVariants;
  setSelectedImage: (image: string) => void;
}

function ColorSelector({ variants, selectedColor, onColorSelect, onImageClick }: {
  variants: ProductWithVariants['variants'];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  onImageClick: (imageUrl: string) => void;
}) {
  const availableColors = useMemo(() => {
    const colors = variants.map(variant => ({ color: variant.color, imageUrl: variant.imageUrl }));
    return [...new Map(colors.map(item => [item.color.name, item])).values()];
  }, [variants]);

  return (
    <div className="flex flex-col gap-2 mt-4">
      <span className="text-sm font-medium text-gray-700">Cor: {selectedColor}</span>
      <div className="flex gap-4">
        {availableColors.map(({ color, imageUrl }) => (
          <button
            key={color.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onColorSelect(color.name);
            }}
            onDoubleClick={() => onImageClick(imageUrl || '')}
            className={`w-16 h-16 rounded-lg border-2 ${selectedColor === color.name ? 'border-blue-500' : 'border-transparent'}`}>
            <Image
              src={imageUrl || ''}
              alt={color.name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-md"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductForm({ product, setSelectedImage }: ProductFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].color.name : null
  );


  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState('');

  useEffect(() => {
    if (selectedColor) {
      const variantsForSelectedColor = product.variants.filter(
        (variant) => variant.color.name === selectedColor
      );
      const firstAvailableVariant = variantsForSelectedColor.find(
        (variant) => (variant.inventory?.quantity ?? 0) > 0
      );
      if (firstAvailableVariant) {
        setSelectedSize(firstAvailableVariant.size);
      } else {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, product.variants]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reseta o tamanho ao mudar a cor
    const variant = product.variants.find(v => v.color.name === color);
    if (variant?.imageUrl) {
      setSelectedImage(variant.imageUrl);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setPopupImageUrl(imageUrl);
    setIsPopupOpen(true);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return product.variants.find((variant) => variant.size === selectedSize && variant.color.name === selectedColor);
  }, [selectedSize, selectedColor, product.variants]);


  const formAction = async (formData: FormData) => {
    formData.append("sku", selectedVariant?.sku || "");
    formData.append("quantity", quantity.toString());

    const result = await AddCartItem(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Produto adicionado à sacola!");
    }
  };


  return (
    <div>
      <Toaster />
      <form action={formAction} className="flex flex-col justify-center">
        <input type="hidden" name="sku" value={selectedVariant?.sku || ""} />

        <h1 className="text-3xl font-bold">{product.name}</h1>
        <span className="text-[#656565] text-[16px] font-medium font-poppins leading-normal">
          Aqui vai a descrição da Categoria Selecionada
        </span>

        <ColorSelector variants={product.variants} selectedColor={selectedColor} onColorSelect={handleColorSelect} onImageClick={handleImageClick} />

        <SizeSelector
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          variants={product.variants.filter(variant => variant.color.name === selectedColor)}
        />

        {selectedVariant && (
          <p className="text-sm text-gray-500 mt-2">
            {selectedVariant.inventory?.quantity ?? 0} em estoque
          </p>
        )}

        <p className="text-3xl font-bold mt-4">
          {formatCurrency(selectedVariant ? selectedVariant.price : product.price)}
        </p>

        <div className="mt-8">
          <p className="font-semibold">Quantidade</p>
          <div className="flex items-center border border-gray-200 rounded-lg w-fit mt-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="px-4 py-2"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-2">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="px-4 py-2"
              disabled={!selectedVariant || quantity >= (selectedVariant.inventory?.quantity ?? 0)}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-4 px-6 rounded-full w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedVariant || (selectedVariant.inventory?.quantity ?? 0) === 0}
          >
            {selectedVariant && (selectedVariant.inventory?.quantity ?? 0) > 0 ? "Adicionar à sacola" : "Esgotado"}
          </button>
          <button
            type="button"
            className="bg-transparent border border-black text-black font-semibold py-4 px-6 rounded-full w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedVariant || (selectedVariant.inventory?.quantity ?? 0) === 0}
          >
            Comprar agora
          </button>
        </div>

        <p className="mt-8 text-gray-700">{product.description}</p>
      </form>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogPortal>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">Imagem da Variação</DialogTitle>
            <Image
              src={popupImageUrl}
              alt="Variant Image"
              width={800}
              height={800}
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}