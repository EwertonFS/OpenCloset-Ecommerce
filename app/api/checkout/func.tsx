// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   const { getUser } = getKindeServerSession();
//   const user = await getUser();

//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { address, cart, total, cpfCnpj, phone } = body;

//     // 1. Criar o cliente no Asaas
//     const customerResponse = await fetch("https://sandbox.asaas.com/api/v3/customers", {
//       method: "POST",
//        headers: {
//      "Content-Type": "application/json",
//      access_token: `Bearer ${process.env.ASAAS_SANDBOX_KEY}`,
//   },
//       body: JSON.stringify({
//         name: `${user.given_name} ${user.family_name}`,
//         email: user.email,
//         cpfCnpj, // precisa vir do form
//         phone,   // opcional
//         address: address.street,
//         addressNumber: address.number,
//         complement: address.complement,
//         province: address.state,
//         postalCode: address.postalCode,
//       }),
//     });




//     const customerData = await customerResponse.json();

//     if (!customerResponse.ok) {
//       console.error("Erro ao criar cliente Asaas:", customerData);
//       return NextResponse.json(
//         { error: "Falha ao criar cliente.", details: customerData },
//         { status: customerResponse.status }
//       );
//     }

//     // 2. Criar o link de pagamento vinculado ao cliente
//     const paymentLinkResponse = await fetch("https://sandbox.asaas.com/api/v3/paymentLinks", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.ASAAS_SANDBOX_KEY!}`,
//       },
//       body: JSON.stringify({
//         name: `Pedido FoxFit - ${user.given_name}`,
//         description: `Pagamento para ${cart.length} item(ns)`,
//         billingType: "UNDEFINED", // cliente escolhe no checkout
//         chargeType: "DETACHED",
//         dueDateLimitDays: 2,
//         value: total,
//         customer: customerData.id, // vincula ao cliente criado
//         callback: true, // habilita callback (só true/false, não URLs)
//       }),
//     });

//     const paymentLinkData = await paymentLinkResponse.json();

//     if (!paymentLinkResponse.ok) {
//       console.error("Erro ao criar link de pagamento Asaas:", paymentLinkData);
//       return NextResponse.json(
//         { error: "Falha ao criar link de pagamento.", details: paymentLinkData },
//         { status: paymentLinkResponse.status }
//       );
//     }

//     // 3. Retornar a URL do checkout
//     return NextResponse.json({ checkoutUrl: paymentLinkData.url });
//   } catch (error) {
//     console.error("Erro ao criar link de pagamento:", error);
//     return NextResponse.json({ message: "Erro interno" }, { status: 500 });
//   }
// }







// Funciona:
//   import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
//   import { NextResponse } from "next/server";


//   export const dynamic = 'force-dynamic';



//   export async function POST(request: Request) {
//     const { getUser } = getKindeServerSession();
//     const user = await getUser();

//     if (!user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     try {
//       const body = await request.json();
//       const { address, cart, total, cpfCnpj, phone } = body;

//               const test = process.env.ASAAS_SANDBOX_KEY! 
//               console.log(`o valor È: ${test}`)
//               // 1. Criar o cliente no Asaas
//               const customerResponse = await fetch("https://sandbox.asaas.com/api/v3/customers", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   "access_token": process.env.ASAAS_SANDBOX_KEY!,
//                 },  
//                 body: JSON.stringify({
//                   name: `${user.given_name} ${user.family_name}`,
//                   email: user.email,
//                   cpfCnpj, // precisa vir do form
//                   phone,   // opcional
//                   address: address.street,
//                   addressNumber: address.number,
//                   complement: address.complement,
//                   province: address.state,
//                   postalCode: address.postalCode,
//                 }),
//               });    
      
      
      
//           const customerData = await customerResponse.json();
      
//           if (!customerResponse.ok) {
//             console.error("Erro ao criar cliente Asaas:", customerData);
//             return NextResponse.json(
//               { error: "Falha ao criar cliente.", details: customerData },
//               { status: customerResponse.status }
//             );
//           }
      
//           // 2. Criar o link de pagamento vinculado ao cliente
//           const paymentLinkResponse = await fetch("https://sandbox.asaas.com/api/v3/paymentLinks", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "access_token": process.env.ASAAS_SANDBOX_KEY!,
//             },
//             body: JSON.stringify({
//               name: `Pedido FoxFit - ${user.username}`,
//               description: `Pagamento para ${cart.length} item(ns)`,
//               billingType: "UNDEFINED", // cliente escolhe no checkout
//               chargeType: "DETACHED",
//               dueDateLimitDays: 2,
//               value: total,
//               customer: customerData.id, // vincula ao cliente criado
//             }),
//           });
//       const paymentLinkData = await paymentLinkResponse.json();

//       if (!paymentLinkResponse.ok) {
//         console.error("Erro ao criar link de pagamento Asaas:", paymentLinkData);
//         return NextResponse.json(
//           { error: "Falha ao criar link de pagamento.", details: paymentLinkData },
//           { status: paymentLinkResponse.status }
//         );
//       }

//       // 3. Retornar a URL do checkout
//       return NextResponse.json({ checkoutUrl: paymentLinkData.url });
//     } catch (error) {
//       console.error("Erro ao criar link de pagamento:", error);
//       return NextResponse.json({ message: "Erro interno" }, { status: 500 });
//     }
//   }




// Opção 2

        import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
    import { NextResponse } from "next/server";
    import { prisma } from "@/lib/prisma";


    export const dynamic = 'force-dynamic';
    
    export async function POST(request: Request) {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        try {
        // const origin = new URL(request.url).origin;
        // const successUrl = `https://5f5ffe336abb.ngrok-free.app/order-review/payment/sucess`;

        const body = await request.json();
        // Tipagem para o item do carrinho para garantir que temos o sku
        type CartItem = { sku: string; quantity: number; price: number; name: string };
        const { address, cart, total }: { address: any; cart: CartItem[]; total: number } = body;

        let addressId: string;

        // 1. Verificar se o endereço já existe ou precisa ser criado
        if (address.id) {
            // Se um ID de endereço é fornecido, usa-o diretamente
            addressId = address.id;
        } else {
            // Se nenhum ID de endereço é fornecido, cria um novo endereço
            const newAddress = await prisma.address.create({
            data: {
                street: address.street,
                number: address.number,
                complement: address.complement,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: "Brasil", // Assumindo Brasil como padrão
                userId: user.id,
            },
            });
            addressId = newAddress.id;
        }

        // 2. Criar o pedido (`Order`) e os itens (`OrderItem`) no banco de dados
        const newOrder = await prisma.order.create({
            data: {
            totalAmount: Math.round(total * 100),
            amount: Math.round(total * 100), // Preenchendo ambos os campos conforme o schema
            status: "pending",
            addressId: addressId, // Usando o ID do endereço correto
            items: {
                create: cart.map((item) => ({
                quantity: item.quantity,
                price: Math.round(item.price * 100),
                variant: {
                    connect: { sku: item.sku }, // Conectando ao ProductVariant via SKU
                },
                })),
            },
            },
        });

        // Encontrar ou criar o provedor de frete 'Melhor Envio'
        console.log("Attempting to find or create 'Melhor Envio' ShippingProvider...");
        let melhorEnvioProvider = await prisma.shippingProvider.findUnique({
            where: { name: "Melhor Envio" },
        });

        if (!melhorEnvioProvider) {
            console.log("'Melhor Envio' ShippingProvider not found, creating...");
            melhorEnvioProvider = await prisma.shippingProvider.create({
                data: { name: "Melhor Envio" },
            });
            console.log("Created 'Melhor Envio' ShippingProvider:", melhorEnvioProvider);
        } else {
            console.log("Found 'Melhor Envio' ShippingProvider:", melhorEnvioProvider);
        }

        // Criar um registro de Shipment inicial para o pedido
        // Os campos providerShipmentId, trackingCode e shippingLabelUrl serão atualizados
        // posteriormente, após a geração da etiqueta de envio real.
        try {
            console.log("Attempting to create Shipment record...");
            await prisma.shipment.create({
                data: {
                    orderId: newOrder.id,
                    shippingProviderId: melhorEnvioProvider.id,
                    providerShipmentId: "", // Placeholder
                    trackingCode: null, // Placeholder
                    shippingLabelUrl: null, // Placeholder
                },
            });
            console.log("Shipment record created successfully for order:", newOrder.id);
        } catch (shipmentError) {
            console.error("Error creating Shipment record for order:", newOrder.id, shipmentError);
            // Optionally, you might want to cancel the order or log this error more prominently
        }

        // 3. Criar o cliente no Asaas (usando o usuário do Kinde e o endereço)
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        const customerResponse = await fetch("https://sandbox.asaas.com/api/v3/customers", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "access_token": process.env.ASAAS_SANDBOX_KEY!,
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

        const customerData = await customerResponse.json();

        if (!customerResponse.ok) {
            console.error("Erro ao criar cliente Asaas:", customerData);
            await prisma.order.update({
            where: { id: newOrder.id },
            data: { status: 'cancelled' },
            });
            return NextResponse.json(
            { error: "Falha ao criar cliente.", details: customerData },
            { status: customerResponse.status }
            );
        }

        // 4. Criar o link de pagamento com a referência externa para o seu pedido
        const paymentLinkResponse = await fetch("https://sandbox.asaas.com/api/v3/paymentLinks", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "access_token": process.env.ASAAS_SANDBOX_KEY!,
            },
            body: JSON.stringify({
            name: `Pedido FoxFit - #${newOrder.id.substring(0, 8)}`,
            description: `Pagamento para ${cart.length} item(ns)`,
            externalReference: newOrder.id,
            billingType: "CREDIT_CARD",
            chargeType: "DETACHED",
            dueDateLimitDays: 2,
            value: total,
            // callback: {
            //   successUrl: successUrl,
            //   autoRedirect: true,
            // },
            }),
        });
        

        const paymentLinkData = await paymentLinkResponse.json();

        if (!paymentLinkResponse.ok) {
            console.error("Erro ao criar link de pagamento Asaas:", paymentLinkData);
            await prisma.order.update({
            where: { id: newOrder.id },
            data: { status: 'cancelled' },  
            });
            return NextResponse.json(
            { error: "Falha ao criar link de pagamento.", details: paymentLinkData },
            { status: paymentLinkResponse.status }
            );
        }

        // 5. Retornar a URL do checkout
        return NextResponse.json({ checkoutUrl: paymentLinkData.url });
        } catch (error) {
        console.error("Erro no processo de checkout:", error);
        // Fornece mais detalhes do erro no log do servidor para depuração
        if (error instanceof Error) {
            console.error(error.message);
        }
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
        }  }




// opção 3 com customers

// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

//   export const dynamic = 'force-dynamic';

// export async function POST(request: Request) {
//   const { getUser } = getKindeServerSession();
//   const user = await getUser();

//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { address, cart, total, creditCard, creditCardHolderInfo } = body;

//     if (!creditCard || !creditCardHolderInfo) {
//       return NextResponse.json({ error: "Dados do cartão de crédito não fornecidos." }, { status: 400 });
//     }

//     // 1. Criar ou verificar endereço
//     let addressId: string;
//     if (address.id) {
//       addressId = address.id;
//     } else {
//       const newAddress = await prisma.address.create({ data: { ...address, userId: user.id, country: "Brasil" } });
//       addressId = newAddress.id;
//     }

//     // 2. Criar o pedido no banco de dados com status PENDENTE
//     const newOrder = await prisma.order.create({
//       data: {
//         totalAmount: Math.round(total * 100),
//         amount: Math.round(total * 100),
//         status: "pending",
//         addressId: addressId,
//         items: {
//           create: cart.map((item: any) => ({
//             quantity: item.quantity,
//             price: Math.round(item.price * 100),
//             variant: { connect: { sku: item.sku } },
//           })),
//         },
//       },
//     });

//     // 3. Buscar dados do usuário do seu DB (para CPF/Telefone)
//     const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
//     if (!dbUser || !dbUser.cpf || !dbUser.phone) {
//       throw new Error("CPF e Telefone do usuário são obrigatórios.");
//     }

//     // 4. Criar/Atualizar o cliente no Asaas
//     const customerResponse = await fetch(`https://sandbox.asaas.com/api/v3/customers`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "access_token": process.env.ASAAS_SANDBOX_KEY!,
//         },
//         body: JSON.stringify({
//           name: `${user.given_name} ${user.family_name}`,
//           email: user.email,
//           cpfCnpj: dbUser.cpf,
//         }),
//       }
//     );
//     const customerData = await customerResponse.json();
//     if (!customerResponse.ok && customerData.errors[0].code !== 'customer_already_exists') {
//       console.error("Erro ao criar cliente Asaas:", customerData);
//       return NextResponse.json({ error: "Falha ao criar cliente.", details: customerData }, { status: 400 });
//     }
//     const customerId = customerData.id || customerData.data[0].id;

//     // 5. Realizar a cobrança direta (Checkout Transparente)
//     const paymentResponse = await fetch(`https://sandbox.asaas.com/api/v3/payments`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "access_token": process.env.ASAAS_SANDBOX_KEY!,
//       },
//       body: JSON.stringify({
//         customer: customerId,
//         billingType: "CREDIT_CARD",
//         dueDate: new Date().toISOString().split('T')[0], // Data de hoje
//         value: total,
//         externalReference: newOrder.id,
//         creditCard: {
//           holderName: creditCard.holderName,
//           number: creditCard.number,
//           expiryMonth: creditCard.expiryMonth,
//           expiryYear: creditCard.expiryYear,
//           ccv: creditCard.ccv,
//         },
//         creditCardHolderInfo: {
//           name: creditCardHolderInfo.name,
//           email: user.email,
//           cpfCnpj: dbUser.cpf,
//           postalCode: address.zipCode,
//           addressNumber: address.number,
//           phone: dbUser.phone,
//         },
//       }),
//     });

//     const paymentData = await paymentResponse.json();

//     if (!paymentResponse.ok || (paymentData.status !== 'RECEIVED' && paymentData.status !== 'CONFIRMED')) {
//       console.error("Falha na cobrança Asaas:", paymentData);
//       await prisma.order.update({
//         where: { id: newOrder.id },
//         data: { status: 'cancelled' },
//       });
//       return NextResponse.json({ error: "Falha no pagamento.", details: paymentData.errors || paymentData }, { status: 400 });
//     }

//     // 6. Se o pagamento foi bem-sucedido, atualizar o pedido para PAGO
//     await prisma.order.update({
//       where: { id: newOrder.id },
//       data: { status: 'PAID' },
//     });

//     // 7. Retornar sucesso para o frontend
//     return NextResponse.json({ success: true, orderId: newOrder.id });

//   } catch (error) {
//     console.error("Erro no processo de checkout:", error);
//     if (error instanceof Error) {
//       console.error(error.message);
//     }
//     return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
//   }
// }



