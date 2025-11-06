import { Product, ProductVariant, Inventory, Category } from "@prisma/client";

export type ProductVariantWithInventory = ProductVariant & {
  inventory: Inventory | null;
};

export type ProductWithRelations = Product & {
  variants: ProductVariantWithInventory[];
  category: Category;
};