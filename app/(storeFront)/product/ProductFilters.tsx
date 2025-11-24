"use client";

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { type Category, type Color } from '@prisma/client';
import { useRouter, usePathname } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface FilterData {
  categories: (Category & { subcategories: { id: string; name: string }[] })[];
  colors: Color[];
  sizes: string[];
  priceRange: { min: number; max: number };
}

interface SelectedFilters {
  categories: string[];
  subcategories: string[];
  sizes: string[];
  colors: string[];
  price: number[] | null;
  sort: string;
}

interface ProductFiltersProps {
  filterData: FilterData;
  selectedFilters: SelectedFilters;
  onFilterChange: (newFilters: Partial<SelectedFilters>) => void;
}

// Componente de conteúdo dos filtros (reutilizado no desktop e mobile)
function FilterContent({
  filterData,
  selectedFilters,
  onFilterChange,
  clearFilters,
  handleCheckboxChange,
  handleSizeChange,
  currentPrice,
  setCurrentPrice
}: any) {
  const { categories, colors, sizes, priceRange } = filterData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" onClick={clearFilters} className="text-sm text-gray-500">Limpar</Button>
      </div>
      <Accordion type="multiple" defaultValue={['category', 'subcategory', 'size', 'color', 'price']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Categoria</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-2">
              {categories.map((category: any) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${category.name}`}
                    checked={selectedFilters.categories.includes(category.name)}
                    onCheckedChange={() => handleCheckboxChange('categories', category.name)}
                  />
                  <label htmlFor={`cat-${category.name}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subcategory">
          <AccordionTrigger>Subcategoria</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pt-2">
              {categories
                .flatMap((c: any) => c.subcategories)
                .map((subcategory: any) => (
                  <div key={subcategory.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`sub-${subcategory.name}`}
                      checked={selectedFilters.subcategories.includes(subcategory.name)}
                      onCheckedChange={() => handleCheckboxChange('subcategories', subcategory.name)}
                    />
                    <label htmlFor={`sub-${subcategory.name}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {subcategory.name}
                    </label>
                  </div>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="size">
          <AccordionTrigger>Tamanho</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {sizes.map((size: string) => (
                <Button
                  key={size}
                  variant={selectedFilters.sizes.includes(size) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="color">
          <AccordionTrigger>Cor</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-3 pt-2" >
              {colors.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => handleCheckboxChange('colors', color.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedFilters.colors.includes(color.name) ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Preço</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <Slider
                value={currentPrice}
                min={priceRange.min}
                max={priceRange.max}
                step={1}
                onValueChange={setCurrentPrice}
                onValueCommit={(value) => onFilterChange({ price: value })}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice[0])}</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function ProductFilters({ filterData, selectedFilters, onFilterChange }: ProductFiltersProps) {
  const { priceRange } = filterData;
  const [currentPrice, setCurrentPrice] = useState(selectedFilters.price || [priceRange.min, priceRange.max]);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setCurrentPrice(selectedFilters.price || [priceRange.min, priceRange.max]);
  }, [selectedFilters.price, priceRange]);

  const handleCheckboxChange = (type: 'categories' | 'subcategories' | 'colors', value: string) => {
    const currentValues = selectedFilters[type];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ [type]: newValues });
  };

  const handleSizeChange = (size: string) => {
    const currentSizes = selectedFilters.sizes;
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    onFilterChange({ sizes: newSizes });
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const filterProps = {
    filterData,
    selectedFilters,
    onFilterChange,
    clearFilters,
    handleCheckboxChange,
    handleSizeChange,
    currentPrice,
    setCurrentPrice
  };

  // Contar filtros ativos
  const activeFiltersCount =
    selectedFilters.categories.length +
    selectedFilters.subcategories.length +
    selectedFilters.sizes.length +
    selectedFilters.colors.length +
    (selectedFilters.price ? 1 : 0);

  return (
    <>
      {/* Versão Desktop - Sidebar fixa */}
      <aside className="hidden lg:block w-64 p-4">
        <FilterContent {...filterProps} />
      </aside>

      {/* Versão Mobile - Sheet (Drawer) */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg rounded-full px-6 py-6 bg-white hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...filterProps} />
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-4 mt-6">
              <SheetClose asChild>
                <Button className="w-full" size="lg">
                  Ver Produtos
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}