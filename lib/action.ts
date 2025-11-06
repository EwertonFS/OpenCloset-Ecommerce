"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { addressSchema, bannerSchema, productSchema, personalDetailsSchema } from "./zodSchema";
import { revalidatePath } from "next/cache";
import {prisma} from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';
import { unstable_noStore as noStore } from "next/cache";
import { type Product, type Category, type Prisma } from "@prisma/client";
import redis from "./redis";

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
      children: true,
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
    let categoryId: string;

    if (subcategoryName) {
      const parentCategory = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });

      const subCategory = await prisma.category.upsert({
        where: { name: subcategoryName },
        update: { parentId: parentCategory.id },
        create: { name: subcategoryName, parentId: parentCategory.id },
      });
      categoryId = subCategory.id;
    } else {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    const slug = generateSlug(productData.name);

    const product = await prisma.product.create({
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
      const hexCode = canonicalColorMap[canonicalName] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

      const colorRecord = await prisma.color.upsert({
        where: { name: canonicalName },
        update: { hexCode: hexCode },
        create: { name: canonicalName, hexCode: hexCode },
      });

      await prisma.productVariant.create({
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
  } catch {
    return { error: "Failed to create product in database" };
  }
  revalidatePath('/');
  revalidatePath("/dashboard/products");
}

export async function editProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    redirect("/login"); // Directly redirect if not authorized
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
    await prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        slug: slug,
        categoryId: categoryId,
      },
    });

    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: productId },
    });

    const newVariantSkus = productVariants.map((v) => v.sku);
    const variantsToDelete = existingVariants.filter(
      (v) => !newVariantSkus.includes(v.sku)
    );

    for (const variant of variantsToDelete) {
      await prisma.inventory.delete({ where: { variantId: variant.id } });
      await prisma.productVariant.delete({ where: { id: variant.id } });
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
      const hexCode = canonicalColorMap[canonicalName] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

      const colorRecord = await prisma.color.upsert({
        where: { name: canonicalName },
        update: { hexCode: hexCode },
        create: { name: canonicalName, hexCode: hexCode },
      });

      const existingVariant = existingVariants.find((v) => v.sku === variant.sku);

      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            ...variantData,
            colorId: colorRecord.id,
            imageUrl: imageUrl,
            inventory: {
              upsert: {
                create: { quantity: quantity },
                update: { quantity: quantity },
              },
            },
            dimensions: {
              upsert: {
                create: { width: width, height: height, length: length, weight: weight },
                update: { width: width, height: height, length: length, weight: weight },
              },
            },
          },
        });
      } else {
        await prisma.productVariant.create({
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

  if (!user || user.email !== "ewerton.businees@gmail.com") {
    redirect("/login");
  }

  const productId = formData.get("id") as string;

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

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export type ProductWithCategory = Product & { category: Category & { parent: Category | null } };

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

  const colors = await prisma.color.findMany();

  const productVariants = await prisma.productVariant.findMany({
    select: {
      size: true,
    },
    distinct: ['size'],
  });
  const sizes = productVariants.map(v => v.size).sort();

  const priceAggregate = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
  });

  return {
    categories: categories.map(c => ({ ...c, subcategories: c.children })), // Mapeia para a interface esperada
    colors,
    sizes,
    priceRange: {
      min: Math.floor((priceAggregate._min.price ?? 0) / 100),
      max: Math.ceil((priceAggregate._max.price ?? 0) / 100),
    },
  };
}

interface FilteredProductsParams {
  categories?: string[];
  subcategories?: string[];
  sizes?: string[];
  colors?: string[];
  price?: [number, number] | null;
  sort?: string;
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
      gte: price[0] * 100,
      lte: price[1] * 100,
    };
  }

  if ((sizes && sizes.length > 0) || (colors && colors.length > 0)) {
    where.variants = {
      some: {},
    };
    if (sizes && sizes.length > 0) {
      where.variants.some.size = { in: sizes };
    }
    if (colors && colors.length > 0) {
      where.variants.some.color = { name: { in: colors } };
    }
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
  });
  return products;
}


//Banner
export async function createBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== 'ewerton.businees@gmail.com') {
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

  if (!user || user.email !== 'ewerton.businees@gmail.com') {
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
    const cookieStore = cookies();
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
    return { error: "SKU do produto é obrigatório." };
  }

  let cartKey: string;
  const cookieStore = await cookies();

  if (user && user.id) {
    cartKey = `cart:${user.id}`;
  } else {
    const visitorId = cookieStore.get('visitor_id')?.value;
    if (!visitorId) {
      return { error: "Carrinho não encontrado." };
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
    return { success: "Produto removido da sacola!" };
  } catch (error) {
    console.error("Erro ao remover item do Redis:", error);
    return { error: "Não foi possível remover o produto da sacola." };
  }
}

export async function updateCartItem() {
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    // This logic might be better placed in a central place on user login
    const newUser = await prisma.user.create({
        data: {
            id: user.id,
            firstName: user.given_name ?? "",
            lastName: user.family_name ?? "",
            email: user.email ?? "",
            profileImage: user.picture,
        }
    });
    return newUser;
  }

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

export async function updateAddress(formData: FormData) {
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