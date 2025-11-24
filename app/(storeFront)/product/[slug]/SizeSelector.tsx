"use client";

import { ProductVariant, Inventory } from "@prisma/client";
import { useMemo } from "react";

interface SizeSelectorProps {
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  variants: (ProductVariant & { inventory: Inventory | null })[];
}

const allSizes = ["PP", "P", "M", "G", "GG", 'Único'];

export function SizeSelector({ selectedSize, onSizeSelect, variants }: SizeSelectorProps) {
  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, { quantity: number }>();
    variants.forEach(variant => {
      const quantity = variant.inventory?.quantity || 0;
      const existing = sizeMap.get(variant.size);
      if (existing) {
        existing.quantity += quantity;
      } else {
        sizeMap.set(variant.size, { quantity });
      }
    });
    return allSizes.map(size => {
      const found = sizeMap.get(size);
      return { size, quantity: found ? found.quantity : 0 };
    });
  }, [variants]);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-medium">Selecionar tamanho</h3>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {availableSizes.map(({ size, quantity }) => (
            <button
              type="button"
              key={size}
              onClick={() => onSizeSelect(size)}
              disabled={quantity === 0}
              className={`flex items-center justify-center gap-2 rounded-md border p-2 ${selectedSize === size
                ? "border-black bg-blue-300"
                : "border-gray-200"
                } ${quantity === 0 ? 'border-dashed' : ''}`}
            >
              <span className={`text-base font-medium ${quantity === 0 ? 'text-gray-400' : ''}`}>{size}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}