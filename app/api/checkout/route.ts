import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Address {
  id?: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Shipping {
  price: string;
}

interface AsaasItem {
  name: string;
  quantity: number;
  value: number;
  imageBase64?: string;
}

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { address, cart, total, shipping }: { address: Address; cart: CartItem[]; total: number, shipping: Shipping } = body;

    // 1. Verifica ou cria endereço
    if (!address.id) {
      const newAddress = await prisma.address.create({
        data: {
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: "Brasil",
          userId: user.id,
        },
      });
      address.id = newAddress.id;
    }

    // 2. Cria um registro de checkout temporário
    const newCheckout = await prisma.checkout.create({
      data: {
        userId: user.id,
        cart: cart as unknown as Prisma.JsonArray,
        address: address as unknown as Prisma.JsonObject,
        shipping: shipping as unknown as Prisma.JsonObject,
        total: Math.round(total * 100),
      },
    });

    // 3. Cria cliente no Asaas
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    const customerResponse = await fetch("https://api-sandbox.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_SANDBOX_KEY!,
      },
      body: JSON.stringify({
        name: `${user.given_name} ${user.family_name}`,
        email: user.email,
        cpfCnpj: dbUser?.cpf,
        phone: dbUser?.phone,
        address: address.street,
        addressNumber: address.number,
        complement: address.complement,
        province: address.state,
        postalCode: address.zipCode,
      }),
    });

    const customerResponseText = await customerResponse.text();
    let customerData;

    if (customerResponse.ok) {
      customerData = JSON.parse(customerResponseText);
    } else {
      // Se falhar ao criar, tenta buscar pelo email (caso já exista)
      if (customerResponseText.includes("email")) {
        const searchResponse = await fetch(`https://api-sandbox.asaas.com/v3/customers?email=${user.email}`, {
          headers: {
            access_token: process.env.ASAAS_SANDBOX_KEY!,
          },
        });
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          customerData = searchData.data[0];
        }
      }
    }

    if (!customerData) {
      console.error("Erro ao criar/buscar cliente no Asaas:", customerResponseText);
      return NextResponse.json({ error: "Erro ao processar cliente", details: customerResponseText }, { status: 400 });
    }

    // Atualiza o checkout com o ID do cliente Asaas (opcional, mas bom para rastreio)
    try {
      console.log(`Tentando atualizar checkout ${newCheckout.id} com Asaas customerId: ${customerData.id}`);
      await prisma.checkout.update({
        where: { id: newCheckout.id },
        data: {
          paymentProviderData: { asaasCustomerId: customerData.id } as unknown as Prisma.JsonObject
        }
      });
      console.log(`Checkout ${newCheckout.id} atualizado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao atualizar o checkout ${newCheckout.id} com dados do Asaas:`, error);
    }

    // 4. Prepara itens para o checkout Asaas, incluindo imagem em Base64
    const asaasItems: AsaasItem[] = await Promise.all(
      cart.map(async (item: CartItem) => {
        let imageBase64: string | null = null;
        if (item.image) {
          try {
            const imageUrl = new URL(item.image, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' || 'https://open-closet.vercel.app').toString();
            const response = await fetch(imageUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              imageBase64 = Buffer.from(buffer).toString('base64');
            }
          } catch (error) {
            console.error(`Falha ao buscar ou converter imagem ${item.image}:`, error);
          }
        }

        const asaasItem: AsaasItem = {
          name: item.name.substring(0, 30),
          quantity: item.quantity,
          value: parseFloat(item.price.toFixed(2)),
        };

        // Adiciona a imagem apenas se ela foi convertida com sucesso
        // e não é excessivamente grande (ex: limite de 1MB)
        if (imageBase64 && imageBase64.length < 1024 * 1024) {
          asaasItem.imageBase64 = imageBase64;
        } else if (imageBase64) {
          console.warn(`Imagem para o item ${item.name} é muito grande (${(imageBase64.length / 1024).toFixed(2)} KB) e não será enviada.`);
        }

        return asaasItem;
      })
    );

    if (shipping && shipping.price) {
      const shippingPrice = parseFloat(shipping.price);
      if (shippingPrice > 0) {
        asaasItems.push({
          name: "Custo de Envio",
          quantity: 1,
          value: shippingPrice,
        });
      }
    }

    // Validação: garantir que todos os itens tenham value válido
    const invalidItems = asaasItems.filter(item => !item.value || item.value <= 0);
    if (invalidItems.length > 0) {
      console.error("Itens com value inválido:", invalidItems);
      return NextResponse.json({
        error: "Erro ao processar itens do carrinho",
        details: "Alguns itens não possuem valor válido"
      }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const payload = {
      billingTypes: ["CREDIT_CARD"],
      chargeTypes: ["DETACHED"],
      items: asaasItems,
      value: parseFloat(total.toFixed(2)), // Garante formato decimal
      description: `Pedido FoxFit - ${cart.length} item(s)`,
      externalReference: newCheckout.id,
      callback: {
        successUrl: `${baseUrl}/order-review/payment/sucess`,
        cancelUrl: `${baseUrl}/order-review/payment/cancel`,
        expiredUrl: `${baseUrl}/order-review/payment/expired`,
      },
      customer: customerData.id,
    };

    console.log("Payload enviado para o Asaas:", JSON.stringify(payload, null, 2));

    // 5. Cria checkout hospedado no Asaas
    const checkoutResponse = await fetch("https://api-sandbox.asaas.com/v3/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_SANDBOX_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const checkoutResponseText = await checkoutResponse.text();

    if (!checkoutResponse.ok) {
      console.error("Erro ao criar checkout no Asaas:", checkoutResponseText);
      return NextResponse.json({ error: "Erro ao criar checkout", details: checkoutResponseText }, { status: checkoutResponse.status });
    }
    const checkoutData = JSON.parse(checkoutResponseText);

    // 5. Retorna URL do checkout para redirecionar
    return NextResponse.json({ checkoutUrl: checkoutData.link });
  } catch (error) {
    console.error("Erro no processo de checkout:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}