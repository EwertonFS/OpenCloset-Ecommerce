import { z } from 'zod';

// não existe Id no original
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Nome é obrigatório'),
  slug: z.string().optional(), // Add slug as optional string
  description: z.string().min(1, 'Descrição é obrigatória'),
  status: z.enum(['draft', 'published', 'archived']),
  price: z.number().min(1).nonnegative(),
  images: z.array(z.string()).min(1, 'at least one image is required'),
  isFeatured: z.boolean().optional(),
  category: z.string().min(1, 'A categoria é obrigatória'),
  subcategory: z.string().optional(),
  variants: z.array(
    z.object({
      id: z.string().optional(), // Added to identify existing variants
      sku: z.string().min(1, 'SKU is required'),
      size: z.enum(['PP', 'P', 'M', 'G', 'GG', 'UNICO']),
      color: z.string().min(1, 'Color is required'),
      price: z.number().min(1).nonnegative(),
      quantity: z.number().min(0).nonnegative(),
      imageUrl: z.string().url().optional(),
      width: z.number().positive('Largura é obrigatória'),
      height: z.number().positive('Altura é obrigatória'),
      length: z.number().positive('Comprimento é obrigatório'),
      weight: z.number().positive('O peso deve ser um número positivo'),
    })
  ),
});

export const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageString: z.string().min(1, 'Image is required'),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  complement: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip Code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const personalDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  cpf: z.string().optional(),
  phone: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'O código deve ter pelo menos 3 caracteres').toUpperCase(),
  discount: z.number().min(1, 'O desconto deve ser maior que 0'),
  type: z.enum(['fixed', 'percentage']),
  expiresAt: z.string().optional(),
});