'use client'

import { Product, ProductVariant } from "@prisma/client";
import { useState } from "react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductForm } from "./ProductForm";

interface ProductViewProps {
  product: Product & { variants: ProductVariant[] };
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