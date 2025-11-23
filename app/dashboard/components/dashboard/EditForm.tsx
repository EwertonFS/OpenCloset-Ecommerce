'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { UploadButton } from '@/lib/uploadthing';
import { productSchema } from '@/lib/zodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2, XIcon } from 'lucide-react';
import Link from 'next/link';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { editProduct } from '@/lib/action';

type ProductForm = z.infer<typeof productSchema>;

import { Category } from '@prisma/client';

// Updated interface to reflect dimensions per variant
interface iAppProps {
  data: {
    id?: string;
    name: string;
    description: string;
    status: "draft" | "published" | "archived";
    price: number;
    images: string[];
    category: string;
    slug: string;
    isFeatured?: boolean;
    variants: {
      id: string; // Variant ID is needed for updating
      sku: string;
      size: "PP" | "P" | "M" | "G" | "GG" | "UNICO";
      color: string;
      price: number;
      quantity: number;
      imageUrl?: string;
      dimensions: {
        id: string;
        width: number;
        height: number;
        length: number;
        weight: number;
      } | null;
    }[];
  };
  categories: (Category & { children: Category[] })[];
}

export function EditForm({ data, categories }: iAppProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(data.images);
  const [isPending, startTransition] = useTransition();
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: data.name,
      description: data.description,
      price: data.price,
      status: data.status,
      isFeatured: data.isFeatured,
      category: data.category,
      images: data.images,
      slug: data.slug,
      // Map variants to include dimension data
      variants: data.variants.map(v => ({
        ...v,
        width: v.dimensions?.width ?? 0,
        height: v.dimensions?.height ?? 0,
        length: v.dimensions?.length ?? 0,
        weight: v.dimensions?.weight ?? 0,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const variants = watch('variants');

  useEffect(() => {
    const currentCategory = categories.find(c => c.id === data.category);

    if (currentCategory) {
      if (currentCategory.parentId) {
        const parent = categories.find(c => c.id === currentCategory.parentId);
        if (parent) {
          setSubCategories(parent.children);
        }
      } else {
        // Even if it's a parent category, it might have children that should be selectable
        setSubCategories(currentCategory.children || []);
      }
    }
  }, [categories, data.category]);

  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  // Helper to determine the value for the Main Category Select
  const getCurrentParentId = () => {
    const currentId = watch('category');
    const currentCategory = categories.find(c => c.id === currentId) ||
      categories.flatMap(c => c.children).find(c => c.id === currentId);

    if (currentCategory?.parentId) {
      return currentCategory.parentId;
    }
    return currentCategory?.id || '';
  };

  // Updated onSubmit to handle new data structure
  const onSubmit = (values: ProductForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', String(values.price));
      formData.append('status', values.status);
      formData.append('isFeatured', String(values.isFeatured));
      formData.append('category', values.category);
      formData.append('productId', data.id as string);

      // The variants now contain the dimension data
      formData.append('variants', JSON.stringify(values.variants));

      images.forEach((image) => {
        formData.append('images', image);
      });

      const result = await editProduct(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Product updated successfully!');
        router.push("/dashboard/products");
      }
    });
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setValue('images', newImages);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4">
        <Button variant={'outline'} size={'icon'} asChild>
          <Link href={'/dashboard/products'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            In this section you can edit product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* General Product Fields */}
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input
                type="text"
                className="w-full"
                placeholder="Product Name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Description</Label>
              <Textarea
                placeholder="Write your description right here..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Price</Label>
              <Input
                type="number"
                className="w-full"
                placeholder="$55"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500">{errors.price.message}</p>
              )}
            </div>

            {/* Dimension fields are now moved inside variants */}

            <div className="flex flex-col gap-3">
              <Label>Feature Product</Label>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              {errors.isFeatured && (
                <p className="text-red-500">{errors.isFeatured.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label>Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selected = categories.find((c) => c.id === value);
                      setSubCategories(selected?.children || []);
                    }}
                    value={getCurrentParentId()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => !c.parentId)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-500">{errors.category.message}</p>
              )}
            </div>

            {subCategories.length > 0 && (
              <div className="flex flex-col gap-3">
                <Label>Subcategoria</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Variants Section */}
            <div className="flex flex-col gap-3">
              <Label>Variações</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-6 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Variação {index + 1}</h3>
                    <Button variant={'destructive'} size={'sm'} onClick={() => remove(index)}>
                      Remover
                    </Button>
                  </div>

                  {/* Variant-specific fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <Label>SKU</Label>
                      <Input
                        type="text"
                        placeholder="SKU"
                        {...register(`variants.${index}.sku`)}
                      />
                      {errors.variants?.[index]?.sku && (
                        <p className="text-red-500">{errors.variants?.[index]?.sku?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label>Tamanho</Label>
                      <Controller
                        name={`variants.${index}.size`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o Tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PP">PP</SelectItem>
                              <SelectItem value="P">P</SelectItem>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="G">G</SelectItem>
                              <SelectItem value="GG">GG</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.variants?.[index]?.size && (
                        <p className="text-red-500">{errors.variants?.[index]?.size?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label>Cor</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Cor"
                          {...register(`variants.${index}.color`)}
                        />
                        <div
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: variants[index]?.color || 'transparent' }}
                        ></div>
                      </div>
                      {errors.variants?.[index]?.color && (
                        <p className="text-red-500">{errors.variants?.[index]?.color?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label>Preço da Variação</Label>
                      <Input
                        type="number"
                        placeholder="R$55"
                        {...register(`variants.${index}.price`, { valueAsNumber: true })}
                      />
                      {errors.variants?.[index]?.price && (
                        <p className="text-red-500">{errors.variants?.[index]?.price?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                      />
                      {errors.variants?.[index]?.quantity && (
                        <p className="text-red-500">{errors.variants?.[index]?.quantity?.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Dimension fields moved inside variant */}
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-md font-semibold mb-2">Dimensões da Variação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex flex-col gap-3">
                        <Label>Largura (cm)</Label>
                        <Input
                          type="number"
                          placeholder="Largura"
                          step="any"
                          {...register(`variants.${index}.width`, { valueAsNumber: true })}
                        />
                        {errors.variants?.[index]?.width && (
                          <p className="text-red-500">{errors.variants?.[index]?.width?.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label>Altura (cm)</Label>
                        <Input
                          type="number"
                          placeholder="Altura"
                          step="any"
                          {...register(`variants.${index}.height`, { valueAsNumber: true })}
                        />
                        {errors.variants?.[index]?.height && (
                          <p className="text-red-500">{errors.variants?.[index]?.height?.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label>Comprimento (cm)</Label>
                        <Input
                          type="number"
                          placeholder="Comprimento"
                          step="any"
                          {...register(`variants.${index}.length`, { valueAsNumber: true })}
                        />
                        {errors.variants?.[index]?.length && (
                          <p className="text-red-500">{errors.variants?.[index]?.length?.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label>Peso (kg)</Label>
                        <Input
                          type="number"
                          placeholder="Peso"
                          step="any"
                          {...register(`variants.${index}.weight`, { valueAsNumber: true })}
                        />
                        {errors.variants?.[index]?.weight && (
                          <p className="text-red-500">{errors.variants?.[index]?.weight?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                    <Label>Imagem da Variação</Label>
                    {variants[index]?.imageUrl && (
                      <div className="relative w-[100px] h-[100px]">
                        <Image
                          src={variants[index].imageUrl!}
                          alt={`Imagem da variação ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                          height={100}
                          width={100}
                        />
                      </div>
                    )}
                    <UploadButton
                      className='bg-amber-200 p-4 rounded-md mx-auto'
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          const url = res[0].url;
                          setValue(`variants.${index}.imageUrl`, url);
                          toast.success('Imagem da variação enviada');
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                    <Input
                      type="hidden"
                      {...register(`variants.${index}.imageUrl`)}
                    />
                    {errors.variants?.[index]?.imageUrl && (
                      <p className="text-red-500">{errors.variants?.[index]?.imageUrl?.message}</p>
                    )}
                  </div>
                </div>
              ))}
              <Button
                className='bg-amber-200 rounded-md mx-auto hover:bg-amber-400'
                type="button"
                onClick={() =>
                  append({ sku: '', size: 'M', color: '', price: 0, quantity: 0, imageUrl: '', width: 0, height: 0, length: 0, weight: 0 })
                }
              >
                Adicionar Variação
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Images</Label>
              <div className="flex flex-col gap-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-[100px] h-[100px]">
                        <Image
                          src={image}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                          height={100}
                          width={100}
                        />
                        <button
                          onClick={() => handleDeleteImage(index)}
                          type="button"
                          className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <UploadButton
                  className='bg-blue-500 rounded-md mx-auto hover:bg-blue-400'
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImages((prev) => [...prev, ...res.map((r) => r.url)]);
                    toast.success('Images uploaded');
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
              {errors.images && (
                <p className="text-red-500">{errors.images.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
