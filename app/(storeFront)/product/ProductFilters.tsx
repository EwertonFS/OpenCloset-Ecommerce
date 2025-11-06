 "use client";
 
 import { useState, useEffect } from 'react';
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Slider } from '@/components/ui/slider';
 import { Button } from '@/components/ui/button';
 import { type Category, type Color } from '@prisma/client';
 import { useRouter, usePathname, useSearchParams } from 'next/navigation';
 
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
 
 export function ProductFilters({ filterData, selectedFilters, onFilterChange }: ProductFiltersProps) {
   const { categories, colors, sizes, priceRange } = filterData;
   const [currentPrice, setCurrentPrice] = useState(selectedFilters.price || [priceRange.min, priceRange.max]);

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
 
   return (
     <aside className="w-full lg:w-64 p-4 space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-lg font-semibold">Filtros</h2>
         <Button variant="ghost" onClick={clearFilters} className="text-sm text-gray-500">Limpar</Button>
       </div>
       <Accordion type="multiple" defaultValue={['category', 'subcategory', 'size', 'color', 'price']} className="w-full">
         <AccordionItem value="category">
           <AccordionTrigger>Categoria</AccordionTrigger>
           <AccordionContent>
             <div className="flex flex-col gap-2 pt-2">
               {categories.map((category) => (
                 <div key={category.id} className="flex items-center gap-2">
                   <Checkbox 
                    id={category.name} 
                    checked={selectedFilters.categories.includes(category.name)}
                    onCheckedChange={() => handleCheckboxChange('categories', category.name)}
                   />
                   <label htmlFor={category.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                 .flatMap(c => c.subcategories)
                 .map((subcategory) => (
                   <div key={subcategory.name} className="flex items-center gap-2">
                     <Checkbox 
                       id={subcategory.name} 
                       checked={selectedFilters.subcategories.includes(subcategory.name)}
                       onCheckedChange={() => handleCheckboxChange('subcategories', subcategory.name)}
                     />
                     <label htmlFor={subcategory.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
               {sizes.map((size) => (
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
               {colors.map((color) => (
                 <button
                   key={color.id}
                   onClick={() => handleCheckboxChange('colors', color.name)}
                   className={`w-6 h-6 rounded-full border-2 ${selectedFilters.colors.includes(color.name) ? 'border-blue-500' : 'border-gray-300'}`}
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
                 step={10}
                 onValueChange={setCurrentPrice}
                 onValueCommit={(value) => onFilterChange({ price: value })}
               />
               <div className="flex justify-between text-sm text-gray-500 mt-2">
                 <span>R${currentPrice[0]}</span>
                 <span>R${currentPrice[1]}</span>
               </div>
             </div>
           </AccordionContent>
         </AccordionItem>
       </Accordion>
     </aside>
   );
 }