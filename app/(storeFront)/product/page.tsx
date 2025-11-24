'use client'
import { useEffect, useState, useMemo } from 'react';
import { getFilteredProducts, getFilterData } from '@/lib/action';
import { type ProductWithCategory, SortOption } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Category, type Color } from '@prisma/client';
import { ProductFilters } from './ProductFilters';
import SimpleFooter from '@/app/components/SimpleFooter';


interface FilterData {
  categories: (Category & { subcategories: { id: string; name: string }[] })[];
  colors: Color[];
  sizes: string[];
  priceRange: { min: number; max: number };
}

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterData, setFilterData] = useState<FilterData | null>(null);

  // Memoize filter values from URL search params
  const selectedFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return {
      categories: params.getAll('categories'),
      subcategories: params.getAll('subcategories'),
      sizes: params.getAll('sizes'),
      colors: params.getAll('colors'),
      price: params.get('price') ? params.get('price')!.split(',').map(Number) : null,
      sort: params.get('sort') || 'newest',
    };
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const sortOption: SortOption = (['newest', 'price_asc', 'price_desc', 'popularity'].includes(selectedFilters.sort)
        ? (selectedFilters.sort as SortOption)
        : SortOption.NEWEST);

      const fetchedProducts = await getFilteredProducts({
        categories: selectedFilters.categories,
        subcategories: selectedFilters.subcategories,
        sizes: selectedFilters.sizes,
        colors: selectedFilters.colors,
        price: selectedFilters.price as [number, number] | null,
        sort: sortOption,
      });
      setProducts(fetchedProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [selectedFilters]);

  useEffect(() => {
    const fetchFilterData = async () => {
      const data = await getFilterData();
      setFilterData(data);
    };
    fetchFilterData();
  }, []);

  const handleFilterChange = (newFilters: Partial<typeof selectedFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      params.delete(key); // Clear existing values for this key
      if (key === 'price' && Array.isArray(value) && value.length === 2) {
        params.set(key, value.join(','));
      }
      else if (Array.isArray(value) && value.length > 0) {
        value.forEach(v => params.append(key, String(v)));
      } else if (typeof value === 'string' && value) {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {filterData && (
            <ProductFilters
              filterData={filterData}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          )}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">O Melhor da Moda Fitness</h1>
              <Select value={selectedFilters.sort} onValueChange={(sort) => handleFilterChange({ sort })}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="price-asc">Preço: Menor para Maior</SelectItem>
                  <SelectItem value="price-desc">Preço: Maior para Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ProductCard products={products} />
            )}
          </main>
        </div>
      </section>
      <SimpleFooter />
    </>
  );
}
