'use client'

import { Prisma } from "@prisma/client";
import { useState } from "react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductForm } from "./ProductForm";

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

interface ProductViewProps {
  product: ProductWithVariants;
}

export function ProductView({ product }: ProductViewProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 my-12">
      <ProductImageGallery images={product.images} productName={product.name} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
      <ProductForm product={product} setSelectedImage={setSelectedImage} />
    </div>
  );
}