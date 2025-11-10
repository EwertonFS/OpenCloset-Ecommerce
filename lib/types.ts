import { type Product, type Category } from "@prisma/client";

export type ProductWithCategory = Product & { category: Category & { parent: Category | null } };

export enum SortOption {
  NEWEST = 'newest',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  POPULARITY = 'popularity',
}