"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { addressSchema, bannerSchema, productSchema, personalDetailsSchema, couponSchema, categorySchema } from "./zodSchema";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';
import { unstable_noStore as noStore } from "next/cache";
import { type Prisma } from "@prisma/client";
import redis from "./redis";
import { ProductWithCategory, SortOption } from "./types";

// Helper function to generate a slug remover daqui 
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // split accented characters into base character and diacritic
    .replace(/[\u0300-\u036f]/g, "") // remove all diacritics
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

async function mergeVisitorCartWithUserCart(userId: string) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;

  if (!visitorId) {
    return; // No visitor cart to merge
  }

  const visitorCartKey = `cart:${visitorId}`;
  const userCartKey = `cart:${userId}`;

  const visitorCartJson: string | null = await redis.get(visitorCartKey);
  if (!visitorCartJson) {
    return; // Visitor cart is empty
  }

  let visitorCart: Record<string, number> = {};
  if (typeof visitorCartJson === 'string') {
    try {
      visitorCart = JSON.parse(visitorCartJson);
    } catch (error) {
      console.error("Error parsing visitor cart JSON:", error);
      return; // Stop if visitor cart is corrupted
    }
  } else if (typeof visitorCartJson === 'object' && visitorCartJson !== null) {
    visitorCart = visitorCartJson as Record<string, number>;
  }

  const userCartJson: string | null | Record<string, number> = await redis.get(userCartKey);
  let userCart: Record<string, number> = {};
  if (typeof userCartJson === 'string') {
    try {
      userCart = JSON.parse(userCartJson);
    } catch (error) {
      console.error("Error parsing user cart JSON:", error);
      // Don't stop, can still merge into an empty cart
    }
  } else if (typeof userCartJson === 'object' && userCartJson !== null) {
    userCart = userCartJson as Record<string, number>;
  }

  // Merge visitor cart into user cart
  for (const sku in visitorCart) {
    if (userCart[sku]) {
      userCart[sku] += visitorCart[sku]; // Add quantities
    } else {
      userCart[sku] = visitorCart[sku];
    }
  }

  // Save the merged cart and delete the old ones
  await redis.set(userCartKey, JSON.stringify(userCart));
  await redis.del(visitorCartKey);
  cookieStore.delete('visitor_id');
}


export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug: slug,
    },
    include: {
      variants: {
        include: {
          inventory: true,
          color: true,
        },
      },
      category: true,
    },
  });
  return product;
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      children: {
        include: {
          products: true,
        },
      },
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Produtos

export async function createProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    redirect("/login");
  }

  const images = formData.getAll("images");
  const variants = JSON.parse(formData.get("variants") as string);

  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    price: Number(formData.get("price")),
    images: images,
    category: formData.get("category"),
    subcategory: formData.get("subcategory"),
    isFeatured: formData.get("isFeatured") === "true",
    variants: variants,
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { variants: productVariants, category: categoryName, subcategory: subcategoryName, ...productData } = validatedFields.data;

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: productData.name,
    },
  });

  if (existingProduct) {
    return { error: "Já existe um produto com este nome." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      let categoryId: string;

      if (subcategoryName) {
        const parentCategory = await tx.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName },
        });

        const subCategory = await tx.category.upsert({
          where: { name: subcategoryName },
          update: { parentId: parentCategory.id },
          create: { name: subcategoryName, parentId: parentCategory.id },
        });
        categoryId = subCategory.id;
      } else {
        const category = await tx.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName },
        });
        categoryId = category.id;
      }

      const slug = generateSlug(productData.name);

      const product = await tx.product.create({
        data: {
          ...productData,
          slug: slug,
          categoryId: categoryId,
        },
      });

      for (const variant of productVariants) {
        const { quantity, imageUrl, color, width, height, length, weight, ...variantData } = variant;

        const aliasMap: Record<string, string> = {
          'black': 'preto', 'white': 'branco', 'gray': 'cinza', 'red': 'vermelho',
          'green': 'verde', 'blue': 'azul', 'yellow': 'amarelo', 'orange': 'laranja',
          'purple': 'roxo', 'pink': 'rosa', 'brown': 'marrom',
        };
        const canonicalColorMap: Record<string, string> = {
          'preto': '#000000', 'branco': '#FFFFFF', 'cinza': '#808080', 'vermelho': '#FF0000',
          'verde': '#008000', 'azul': '#0000FF', 'amarelo': '#FFFF00', 'laranja': '#FFA500',
          'roxo': '#800080', 'rosa': '#FFC0CB', 'marrom': '#A52A2A',
        };

        const inputColor = color.toLowerCase();
        const canonicalName = aliasMap[inputColor] || inputColor;
        const hexCode = canonicalColorMap[canonicalName] || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

        const colorRecord = await tx.color.upsert({
          where: { name: canonicalName },
          update: { hexCode: hexCode },
          create: { name: canonicalName, hexCode: hexCode },
        });

        await tx.productVariant.create({
          data: {
            ...variantData,
            colorId: colorRecord.id,
            imageUrl: imageUrl,
            productId: product.id,
            inventory: {
              create: {
                quantity: quantity,
              },
            },
            stockMovements: {
              create: {
                type: 'IN',
                quantity: quantity,
                notes: 'Estoque inicial',
              }
            },
            dimensions: {
              create: {
                width: width,
                height: height,
                length: length,
                weight: weight,
              },
            },
          },
        });
      }
    });
  } catch {
    return { error: "Failed to create product in database" };
  }
  revalidatePath('/');
  revalidatePath("/dashboard/products");
}

export async function editProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || (user.email !== "ewerton.businees@gmail.com" && user.email !== "erickalaissantos@gmail.com")) {
    redirect("/login");
  }

  const productId = formData.get("productId") as string;
  const images = formData.getAll("images");
  const variants = JSON.parse(formData.get("variants") as string);

  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    price: Number(formData.get("price")),
    images: images,
    category: formData.get("category"),
    isFeatured: formData.get("isFeatured") === "true",
    variants: variants,
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    throw new Error("Invalid fields");
  }

  const { variants: productVariants, category: categoryId, ...productData } = validatedFields.data;

  const slug = generateSlug(productData.name);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          ...productData,
          slug: slug,
          categoryId: categoryId,
        },
      });

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: productId },
        include: { inventory: true },
      });

      const newVariantSkus = productVariants.map((v) => v.sku);
      const variantsToDelete = existingVariants.filter(
        (v) => !newVariantSkus.includes(v.sku)
      );

      for (const variant of variantsToDelete) {
        await tx.stockMovement.deleteMany({ where: { variantId: variant.id } });
        await tx.inventory.delete({ where: { variantId: variant.id } });
        await tx.productVariant.delete({ where: { id: variant.id } });
      }

      for (const variant of productVariants) {
        const { quantity, imageUrl, color, width, height, length, weight, ...variantData } = variant;

        const aliasMap: Record<string, string> = {
          'black': 'preto', 'white': 'branco', 'gray': 'cinza', 'red': 'vermelho',
          'green': 'verde', 'blue': 'azul', 'yellow': 'amarelo', 'orange': 'laranja',
          'purple': 'roxo', 'pink': 'rosa', 'brown': 'marrom',
        };
        const canonicalColorMap: Record<string, string> = {
          'preto': '#000000', 'branco': '#FFFFFF', 'cinza': '#808080', 'vermelho': '#FF0000',
          'verde': '#008000', 'azul': '#0000FF', 'amarelo': '#FFFF00', 'laranja': '#FFA500',
          'roxo': '#800080', 'rosa': '#FFC0CB', 'marrom': '#A52A2A',
        };

        const inputColor = color.toLowerCase();
        const canonicalName = aliasMap[inputColor] || inputColor;
        const hexCode = canonicalColorMap[canonicalName] || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

        const colorRecord = await tx.color.upsert({
          where: { name: canonicalName },
          update: { hexCode: hexCode },
          create: { name: canonicalName, hexCode: hexCode },
        });

        const existingVariant = existingVariants.find((v) => v.sku === variant.sku);

        if (existingVariant) {
          await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              ...variantData,
              colorId: colorRecord.id,
              imageUrl: imageUrl,
              dimensions: {
                upsert: {
                  create: { width: width, height: height, length: length, weight: weight },
                  update: { width: width, height: height, length: length, weight: weight },
                },
              },
            },
          });

          const currentQuantity = existingVariant.inventory?.quantity ?? 0;
          const newQuantity = quantity;
          const diff = newQuantity - currentQuantity;

          if (diff !== 0) {
            await tx.inventory.upsert({
              where: { variantId: existingVariant.id },
              update: {
                quantity: {
                  increment: diff,
                },
              },
              create: {
                variantId: existingVariant.id,
                quantity: newQuantity,
              },
            });

            await tx.stockMovement.create({
              data: {
                type: diff > 0 ? 'IN' : 'OUT',
                quantity: Math.abs(diff),
                notes: 'Ajuste manual',
                variantId: existingVariant.id,
              },
            });
          }
        } else {
          await tx.productVariant.create({
            data: {
              ...variantData,
              colorId: colorRecord.id,
              imageUrl: imageUrl,
              productId: productId,
              inventory: {
                create: {
                  quantity: quantity,
                },
              },
              stockMovements: {
                create: {
                  type: 'IN',
                  quantity: quantity,
                  notes: 'Estoque inicial',
                },
              },
              dimensions: {
                create: {
                  width: width,
                  height: height,
                  length: length,
                  weight: weight,
                },
              },
            },
          });
        }
      }
    }, {
      maxWait: 60000, // 60 seconds
      timeout: 60000,  // 60 seconds
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product in database" };
  }
}

export async function deleteProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || (user.email !== "ewerton.businees@gmail.com" && user.email !== "erickalaissantos@gmail.com")) {
    redirect("/login");
  }

  const productId = formData.get("id") as string;

  // Check if there are any orders associated with this product
  const hasOrders = await prisma.orderItem.findFirst({
    where: {
      variant: {
        productId: productId,
      },
    },
  });

  if (hasOrders) {
    // If there are orders, we cannot delete. Archive instead.
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "archived",
      },
    });
  } else {
    // If no orders, proceed with full deletion
    // Delete related inventory first
    await prisma.inventory.deleteMany({
      where: {
        variant: {
          productId: productId,
        },
      },
    });

    // Then delete product variants
    await prisma.productVariant.deleteMany({
      where: {
        productId: productId,
      },
    });

    // Finally, delete the product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function getFilterData() {
  noStore();
  const categories = await prisma.category.findMany({
    where: { parentId: null }, // Apenas categorias pai
    include: {
      children: { // Renomeado de subcategories para children para corresponder ao schema
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const colors = await prisma.color.findMany({
    where: {
      variants: {
        some: {}
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Deduplicate colors by name (case-insensitive) to avoid visual duplicates
  const uniqueColors = [];
  const seenNames = new Set();
  for (const color of colors) {
    const normalized = color.name.toLowerCase().trim();
    if (!seenNames.has(normalized)) {
      seenNames.add(normalized);
      uniqueColors.push(color);
    }
  }

  const productVariants = await prisma.productVariant.findMany({
    select: {
      size: true,
    },
    distinct: ['size'],
  });
  const sizes = productVariants.map(v => v.size).sort();



  return {
    categories: categories.map(c => ({ ...c, subcategories: c.children })), // Mapeia para a interface esperada
    colors: uniqueColors,
    sizes,
    priceRange: {
      min: 1,
      max: 1000,
    },
  };
}


interface FilteredProductsParams {
  categories?: string[];
  subcategories?: string[];
  sizes?: string[];
  colors?: string[];
  price?: [number, number] | null;
  sort?: SortOption;
}

export async function getFilteredProducts({
  categories,
  subcategories,
  sizes,
  colors,
  price,
  sort,
}: FilteredProductsParams): Promise<ProductWithCategory[]> {
  noStore();

  const where: Prisma.ProductWhereInput = {
    status: 'published',
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = {};

  switch (sort) {
    case SortOption.PRICE_ASC:
      orderBy = { price: 'asc' };
      break;
    case SortOption.PRICE_DESC:
      orderBy = { price: 'desc' };
      break;
    case SortOption.POPULARITY:
      // Implement popularity logic, e.g., based on orders or views
      // For now, let's sort by creation date as a fallback
      orderBy = { createdAt: 'desc' };
      break;
    case SortOption.NEWEST:
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  if (subcategories && subcategories.length > 0) {
    where.category = { name: { in: subcategories } };
  } else if (categories && categories.length > 0) {
    const subcategoriesOfSelectedCategories = await prisma.category.findMany({
      where: {
        parent: {
          name: {
            in: categories
          }
        }
      },
      select: {
        name: true
      }
    });
    const subcategoryNames = subcategoriesOfSelectedCategories.map(c => c.name);
    const allCategoryNames = [...subcategoryNames, ...categories];

    where.category = { name: { in: allCategoryNames } };
  }

  if (price) {
    where.price = {
      gte: price[0],
      lte: price[1],
    };
  }

  if ((sizes && sizes.length > 0) || (colors && colors.length > 0)) {
    // Cria um objeto intermediário tipado para ProductVariantWhereInput
    const variantWhere: Prisma.ProductVariantWhereInput = {};

    if (sizes && sizes.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variantWhere.size = { in: sizes as any };
    }

    if (colors && colors.length > 0) {
      // Filtrar por relação color — tipa como Prisma.ColorWhereInput
      variantWhere.color = { name: { in: colors } } as Prisma.ColorWhereInput;
    }

    where.variants = {
      some: variantWhere,
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
    orderBy,
  });

  return products;
}


//Banner
export async function createBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || (user.email !== 'ewerton.businees@gmail.com' && user.email !== 'erickalaissantos@gmail.com')) {
    redirect('/');
  }

  const validatedFields = bannerSchema.safeParse({
    title: formData.get('title'),
    imageString: formData.get('imageString'),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    throw new Error('Invalid form data');
  }

  await prisma.banner.create({
    data: {
      title: validatedFields.data.title,
      imageString: validatedFields.data.imageString,
    },
  });

  revalidatePath('/dashboard/banner');
  redirect('/dashboard/banner');
}


export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || (user.email !== 'ewerton.businees@gmail.com' && user.email !== 'erickalaissantos@gmail.com')) {
    redirect('/');
  }

  await prisma.banner.delete({
    where: {
      id: formData.get('bannerId') as string,
    },
  });

  revalidatePath('/dashboard/banner');
  redirect('/dashboard/banner');
}



//Carrinho de Produtos
export async function AddCartItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const sku = formData.get('sku') as string;
  const quantity = Number(formData.get('quantity') || 1);

  if (!sku) {
    return { error: "SKU do produto é obrigatório." };
  }

  if (user && user.id) {
    await mergeVisitorCartWithUserCart(user.id);
  }

  let cartKey: string;

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const cookieStore = await cookies();
    const currentVisitorId = cookieStore.get('visitor_id')?.value;
    let finalVisitorId: string;

    if (!currentVisitorId) {
      finalVisitorId = uuidv4();
      cookieStore.set('visitor_id', finalVisitorId, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    } else {
      finalVisitorId = currentVisitorId;
    }

    cartKey = `cart:${finalVisitorId}`;
  }

  try {
    const cartJson: string | null | Record<string, number> = await redis.get(cartKey);
    console.log("Valor de cartJson (AddCartItem):", cartJson);
    let cart: Record<string, number> = {};

    if (cartJson) {
      if (typeof cartJson === 'string') {
        if (cartJson !== "[object Object]") {
          try {
            cart = JSON.parse(cartJson);
          } catch (error) {
            console.error("Erro ao analisar JSON do carrinho em AddCartItem:", error);
            // Opcional: você pode querer limpar o carrinho corrompido no Redis aqui
            // await redis.del(cartKey);
          }
        }
      } else if (typeof cartJson === 'object' && cartJson !== null) {
        cart = cartJson;
      }
    }

    cart[sku] = (cart[sku] || 0) + quantity;

    await redis.set(cartKey, JSON.stringify(cart));

    revalidatePath("/");
    return { success: "Produto adicionado à sacola!" };
  } catch (error) {
    console.error("Erro ao adicionar item ao Redis:", error);
    return { error: "Não foi possível adicionar o produto à sacola." };
  }
}

export async function getCart() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user && user.id) {
    await mergeVisitorCartWithUserCart(user.id);
  }

  let cartKey: string;
  const cookieStore = await cookies();

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
      console.log("Debug Cart: Nenhum usuário logado ou visitor_id encontrado. Retornando carrinho vazio.");
      return []; // Nenhum carrinho para um novo visitante
    }
    cartKey = `cart:${visitorId}`;
  }

  console.log(`Debug Cart: Usando cartKey: ${cartKey}`);

  const cartJson: string | null | Record<string, number> = await redis.get(cartKey);
  console.log("Debug Cart: Valor bruto do Redis (cartJson):", cartJson);
  let cartItems: Record<string, number> = {};

  if (cartJson) {
    if (typeof cartJson === 'string') {
      if (cartJson !== "[object Object]") {
        try {
          cartItems = JSON.parse(cartJson);
        } catch (error) {
          console.error("Erro ao analisar JSON do carrinho:", error);
          // Opcional: você pode querer limpar o carrinho corrompido no Redis aqui
          // await redis.del(cartKey);
        }
      }
    } else if (typeof cartJson === 'object' && cartJson !== null) {
      cartItems = cartJson;
    }
  }
  console.log("Debug Cart: Itens do carrinho após o parse:", cartItems);

  const skus = Object.keys(cartItems);
  console.log("Debug Cart: SKUs extraídos do carrinho:", skus);

  if (skus.length === 0) {
    console.log("Debug Cart: Nenhum SKU encontrado, retornando carrinho vazio.");
    return [];
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      sku: {
        in: skus,
      },
    },
    include: {
      product: true,
    },
  });

  const cartDetails = variants.map((variant) => {
    const quantity = cartItems[variant.sku];
    return {
      sku: variant.sku,
      name: variant.product.name,
      size: variant.size,
      price: variant.product.price,
      image: variant.product.images[0],
      quantity: quantity,
      lineTotal: quantity * variant.product.price,
    };
  });

  return cartDetails;
}

export async function removeCartItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const sku = formData.get('sku') as string;

  if (!sku) {
    console.error("SKU do produto é obrigatório.");
    return;
  }

  let cartKey: string;
  const cookieStore = await cookies();

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
      console.error("Carrinho não encontrado.");
      return;
    }
    cartKey = `cart:${visitorId}`;
  }

  try {
    const cartJson: string | null | Record<string, number> = await redis.get(cartKey);
    let cart: Record<string, number> = {};

    if (cartJson) {
      if (typeof cartJson === 'string') {
        if (cartJson !== "[object Object]") {
          try {
            cart = JSON.parse(cartJson);
          } catch (error) {
            console.error("Erro ao analisar JSON do carrinho em removeCartItem:", error);
          }
        }
      } else if (typeof cartJson === 'object' && cartJson !== null) {
        cart = cartJson;
      }
    }

    delete cart[sku];

    await redis.set(cartKey, JSON.stringify(cart));

    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao remover item do Redis:", error);
  }
}

export async function updateCartItem(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const sku = formData.get('sku') as string;
  const quantity = Number(formData.get('quantity')); // This will be the new total quantity for the item

  if (!sku) {
    return { error: "SKU do produto é obrigatório." };
  }
  if (isNaN(quantity) || quantity <= 0) {
    return { error: "Quantidade inválida." };
  }

  let cartKey: string;
  const cookieStore = await cookies();

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
      return { error: "Carrinho não encontrado para visitante." };
    }
    cartKey = `cart:${visitorId}`;
  }

  try {
    const cartJson: string | null | Record<string, number> = await redis.get(cartKey);
    let cart: Record<string, number> = {};

    if (cartJson) {
      if (typeof cartJson === 'string') {
        if (cartJson !== "[object Object]") {
          try {
            cart = JSON.parse(cartJson);
          } catch (error) {
            console.error("Erro ao analisar JSON do carrinho em updateCartItem:", error);
            return { error: "Erro ao carregar carrinho." };
          }
        }
      } else if (typeof cartJson === 'object' && cartJson !== null) {
        cart = cartJson;
      }
    }

    if (!cart[sku]) {
      return { error: "Produto não encontrado na sacola." };
    }

    const variant = await prisma.productVariant.findUnique({
      where: { sku: sku },
      include: { inventory: true },
    });

    if (!variant || !variant.inventory || quantity > variant.inventory.quantity) {
      return { error: `Apenas ${variant?.inventory?.quantity ?? 0} unidades disponíveis para ${variant?.sku ?? 'este item'}.` };
    }

    cart[sku] = quantity;

    await redis.set(cartKey, JSON.stringify(cart));

    revalidatePath("/");
    return { success: "Quantidade atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar item no Redis:", error);
    return { error: "Não foi possível atualizar a quantidade do produto." };
  }
}

export async function clearCart() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  let cartKey: string;
  const cookieStore = await cookies();

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
      return { success: "Carrinho já está vazio." };
    }
    cartKey = `cart:${visitorId}`;
  }

  try {
    await redis.del(cartKey);
    revalidatePath("/");
    revalidatePath("/order-review/identification");
    return { success: "Carrinho limpo com sucesso!" };
  } catch (error) {
    console.error("Erro ao limpar o carrinho no Redis:", error);
    return { error: "Não foi possível limpar o carrinho." };
  }
}

export async function getDbUser() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Use upsert to avoid race condition when multiple requests try to create the same user
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      firstName: user.given_name ?? "",
      lastName: user.family_name ?? "",
      email: user.email ?? "",
      profileImage: user.picture,
    },
    create: {
      id: user.id,
      firstName: user.given_name ?? "",
      lastName: user.family_name ?? "",
      email: user.email ?? "",
      profileImage: user.picture,
    },
  });

  return dbUser;
}

// Endereço
export async function createAddress(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        email: user.email ?? "",
        profileImage: user.picture,
      },
    });
  }

  const validatedFields = addressSchema.safeParse({
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement"),
    district: formData.get("district"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    country: formData.get("country"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  await prisma.address.create({
    data: {
      ...validatedFields.data,
      userId: user.id,
    },
  });

  revalidatePath("/user/address-book");
  return { success: true };
}

export async function getUserAddresses() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
  });

  return addresses;
}

export async function updateAddress(prevState: { error: string } | void, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/user/address-book");
  }

  const addressId = formData.get("addressId") as string;

  const validatedFields = addressSchema.safeParse({
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement"),
    district: formData.get("district"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    country: formData.get("country"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  await prisma.address.update({
    where: { id: addressId },
    data: validatedFields.data,
  });

  revalidatePath("/user/address-book");
  redirect("/user/address-book");
}

export async function updateUserPersonalDetails(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const validatedFields = personalDetailsSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    cpf: formData.get("cpf"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        cpf: validatedFields.data.cpf,
        phone: validatedFields.data.phone,
      },
    });

    revalidatePath("/user/personal");
    return { success: "Details updated successfully" };
  } catch {
    return { error: "Failed to update details" };
  }
}

export async function getSalesData() {
  noStore();
  try {
    const salesData = await prisma.order.findMany({
      where: {
        status: 'paid',
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const monthlySales = salesData.reduce((acc, { createdAt, totalAmount }) => {
      const month = new Date(createdAt).toLocaleString('pt-BR', { month: 'long' });
      const total = totalAmount || 0;

      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += total / 100;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(monthlySales).map(([month, total]) => ({
      month,
      desktop: total,
    }));

    return chartData;

  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    return [];
  }
}

// Favoritos
export async function toggleFavorite(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { error: "Você precisa estar logado para favoritar produtos." };
  }

  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      revalidatePath("/");
      revalidatePath("/user/favorites");
      return { success: "Produto removido dos favoritos.", isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          productId: productId,
        },
      });
      revalidatePath("/");
      revalidatePath("/user/favorites");
      return { success: "Produto adicionado aos favoritos.", isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { error: "Erro ao atualizar favoritos." };
  }
}

export async function checkIsFavorite(productId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return false;

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: productId,
      },
    },
  });

  return !!favorite;
}

export async function getUserFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: {
        include: {
          category: {
            include: {
              parent: true
            }
          },
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return favorites.map(fav => fav.product);
}

// Cupons
export async function createCoupon(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    return { error: "Não autorizado" };
  }

  const validatedFields = couponSchema.safeParse({
    code: formData.get("code"),
    discount: Number(formData.get("discount")),
    type: formData.get("type"),
    expiresAt: formData.get("expiresAt"),
    categoryId: formData.get("categoryId") || undefined,
    productId: formData.get("productId") || undefined,
    variantId: formData.get("variantId") || undefined,
  });

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { code, discount, type, expiresAt, categoryId, productId, variantId } = validatedFields.data;

  try {
    await prisma.coupon.create({
      data: {
        code,
        discount,
        type: type as "fixed" | "percentage",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId,
        productId,
        variantId,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar cupom. O código pode já existir." };
  }

  revalidatePath("/dashboard/coupons");
  return { success: "Cupom criado com sucesso!" };
}

export async function deleteCoupon(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    return { error: "Não autorizado" };
  }

  const couponId = formData.get("couponId") as string;

  try {
    await prisma.coupon.delete({
      where: {
        id: couponId,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao deletar cupom" };
  }

  revalidatePath("/dashboard/coupons");
  return { success: "Cupom deletado com sucesso!" };
}

// Categorias
export async function createCategory(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    return { error: "Não autorizado" };
  }

  const validatedFields = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
    isArchived: formData.get("isArchived") === "true",
  });

  if (!validatedFields.success) {
    return { error: "Dados inválidos" };
  }

  try {
    await prisma.category.create({
      data: {
        name: validatedFields.data.name,
        parent: validatedFields.data.parentId
          ? { connect: { id: validatedFields.data.parentId } }
          : undefined,
        isArchived: validatedFields.data.isArchived || false,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar categoria." };
  }

  revalidatePath("/dashboard/categories");
  return { success: "Categoria criada com sucesso!" };
}

export async function updateCategory(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    return { error: "Não autorizado" };
  }

  const categoryId = formData.get("categoryId") as string;

  const validatedFields = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
    isArchived: formData.get("isArchived") === "true",
  });

  if (!validatedFields.success) {
    return { error: "Dados inválidos" };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validatedFields.data.name,
        parent: validatedFields.data.parentId
          ? { connect: { id: validatedFields.data.parentId } }
          : { disconnect: true },
        isArchived: validatedFields.data.isArchived || false,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar categoria." };
  }

  revalidatePath("/dashboard/categories");
  return { success: "Categoria atualizada com sucesso!" };
}

export async function deleteCategory(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    return { error: "Não autorizado" };
  }

  const categoryId = formData.get("categoryId") as string;

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error(error);
    return { error: "Erro ao deletar categoria. Verifique se existem produtos associados." };
  }

  revalidatePath("/dashboard/categories");
  return { success: "Categoria deletada com sucesso!" };
}

export async function updateUserCpfPhone(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const cpf = formData.get("cpf") as string;
  const phone = formData.get("phone") as string;

  if (!cpf || !phone) {
    return { error: "CPF e Telefone são obrigatórios." };
  }

  // Basic validation
  if (cpf.length < 11) {
    return { error: "CPF inválido." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        cpf: cpf,
        phone: phone,
      },
    });

    revalidatePath("/order-review/identification");
    return { success: "Dados atualizados com sucesso" };
  } catch (error) {
    console.error("Error updating user CPF/Phone:", error);
    return { error: "Falha ao atualizar dados" };
  }
}