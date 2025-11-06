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
import { createProduct } from '@/lib/action';
import { Textarea } from '@/components/ui/textarea';

type ProductForm = z.infer<typeof productSchema>;

// Helper function to generate a slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // split accented characters into base character and diacritic
    .replace(/[\u0300-\u036f]/g, "") // remove all diacritics
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

const ProductCreateRoute = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
      status: 'published',
      isFeatured: false,
      images: [],
      variants: [],
      slug: '',
      subcategory: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const variants = watch('variants');
  const name = watch('name');

  useEffect(() => {
    if (name) {
      const slug = generateSlug(name);
      setValue('slug', slug);
    }
  }, [name, setValue]);

  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const onSubmit = (data: ProductForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug || generateSlug(data.name));
      formData.append('description', data.description);
      formData.append('price', String(data.price));

      formData.append('status', data.status);
      formData.append('isFeatured', String(data.isFeatured));
      formData.append('category', data.category);
      formData.append('subcategory', data.subcategory || '');
      formData.append('variants', JSON.stringify(data.variants));
      images.forEach((image) => {
        formData.append('images', image);
      });

      const result = await createProduct(formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success('Produto criado com sucesso!');
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
        <h1 className="text-xl font-semibold tracking-tight">Novo Produto</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Detalhes do Produto</CardTitle>
          <CardDescription>
            Nesta seção você pode criar um produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label>Nome</Label>
              <Input
                type="text"
                className="w-full"
                placeholder="Nome do Produto"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Slug</Label>
              <Input
                type="text"
                className="w-full"
                placeholder="Slug do Produto"
                {...register('slug')}
                disabled
              />
              {errors.slug && (
                <p className="text-red-500">{errors.slug.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Escreva sua descrição aqui..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Preço</Label>
              <Input
                type="number"
                className="w-full"
                placeholder="R$55"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label>Produto em Destaque</Label>
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
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
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
              <Input
                type="text"
                className="w-full"
                placeholder="Categoria"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-red-500">{errors.category.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label>Subcategoria</Label>
              <Input
                type="text"
                className="w-full"
                placeholder="Subcategoria (Opcional)"
                {...register('subcategory')}
              />
              {errors.subcategory && (
                <p className="text-red-500">{errors.subcategory.message}</p>
              )}
            </div>


            <div className="flex flex-col gap-3">
              <Label>Imagens</Label>
              {images.length > 0 ? (
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
              ) : (
                <UploadButton
                className='bg-amber-200 p-4 rounded-md mx-auto'
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImages(res.map((r) => r.url));
                    toast.success('Imagens enviadas');
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              )}
              {errors.images && (
                <p className="text-red-500">{errors.images.message}</p>
              )}
            </div>

                  {/* Variação */}
            <div className="flex flex-col gap-3">
              <Label>Variações</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-3 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Variação {index + 1}</h3>
                    <Button variant={'destructive'} size={'sm'} onClick={() => remove(index)}>
                      Remover
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>SKU</Label>
                    <Input
                      type="text"
                      className="w-full"
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
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o Tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PP">PP</SelectItem>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="GG">GG</SelectItem>
                            <SelectItem value="UNICO">Unico</SelectItem>
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
                    <Input
                      type="text"
                      className="w-full"
                      placeholder="Cor"
                      {...register(`variants.${index}.color`)}
                    />
                    {errors.variants?.[index]?.color && (
                      <p className="text-red-500">{errors.variants?.[index]?.color?.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Preço</Label>
                    <Input
                      type="number"
                      className="w-full"
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
                      className="w-full"
                      placeholder="100"
                      {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                    />
                    {errors.variants?.[index]?.quantity && (
                      <p className="text-red-500">{errors.variants?.[index]?.quantity?.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Largura (cm)</Label>
                    <Input
                      type="number"
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
                      placeholder="Peso"
                      step="any"
                      {...register(`variants.${index}.weight`, { valueAsNumber: true })}
                    />
                    {errors.variants?.[index]?.weight && (
                      <p className="text-red-500">{errors.variants?.[index]?.weight?.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Imagem da Variação</Label>
                    {variants[index]?.imageUrl && (
                      <div className="relative w-[100px] h-[100px]">
                        <Image
                          src={variants[index].imageUrl}
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
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Produto'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProductCreateRoute;