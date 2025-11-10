import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { addToCart, checkoutCart, generateLabel, getLabelPrintUrl } from '@/lib/melhor-envio';



// Interfaces do Asaas
interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  paymentDate?: string;
}

interface AsaasWebhookPayload {
  event: string;
  payment: AsaasPayment;
}

// Interfaces do Checkout
interface CartItem {
  quantity: number;
  price: number;
  sku: string;
  variantId?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variantId: string;
}

interface CheckoutAddress {
  id: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PaymentProviderData {
  customerId: string;
  paymentId?: string;
  status?: string;
  value?: number;
  paymentDate?: string;
}

interface Checkout {
  id: string;
  total: number;
  cart: CartItem[];
  address: CheckoutAddress;
  paymentProviderData: PaymentProviderData;
}

interface Order {
  id: string;
  items: OrderItem[];
}

// Interfaces do Melhor Envio
interface MelhorEnvioOrder {
  id: string;
  tracking?: string;
  status?: string;
  deliveryTime?: number;
}

interface MelhorEnvioPurchase {
  purchase: {
    orders: MelhorEnvioOrder[];
    protocol: string;
    status: string;
  };
}

// TODO: Implementar a verificação real da assinatura do Asaas.
// const verifyAsaasSignature = async (signature: string | null): Promise<boolean> => {
//   const webhookToken = process.env.ASAAS_WEBHOOK_SECRET;

//   if (!signature || !webhookToken) {
//     console.error("Chave secreta do webhook ou assinatura ausente.");
//     return false;
//   }

//   console.warn("AVISO: A verificação da assinatura do webhook do Asaas não está implementada. Isso é um risco de segurança em produção.");
//   return true;
// };





export async function POST(request: Request) {
  const headersList = await headers();
//  const signature = headersList.get('Asaas-Signature');
  // const isVerified = await verifyAsaasSignature(signature);
  // if (!isVerified) {
  //   return NextResponse.json({ message: 'Não autorizado: assinatura inválida' }, { status: 401 });
  // }

  try {
    const payload = await request.json() as AsaasWebhookPayload;
    console.log("Payload completo do webhook Asaas:", JSON.stringify(payload, null, 2));
    const eventType = payload.event;

    console.log(`Webhook do Asaas recebido: ${eventType}`);

    if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
      const paymentData = payload.payment;
      const paymentId = paymentData.id;
      const asaasCustomerId = paymentData.customer;

      if (!asaasCustomerId) {
        console.error(`Webhook para pagamento ${paymentId} recebido sem um ID de cliente Asaas. O pedido não pode ser processado.`);
        return NextResponse.json({ message: 'ID do cliente ausente no webhook.' }, { status: 400 });
      }

      // Encontrar o registro de checkout temporário usando o asaasCustomerId
      const checkout = await prisma.checkout.findFirst({
  
        where: {
        
          paymentProviderData: {
            path: ['customerId'],
            equals: asaasCustomerId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as Checkout | null;


      if (!checkout) {
        console.error(`Registro de checkout com asaasCustomerId ${asaasCustomerId} não encontrado para o pagamento ${paymentId}.`);
        return NextResponse.json({ message: `Checkout não encontrado.` }, { status: 200 });
      }

            // 6. Criar o pedido real no banco de dados e decrementar o estoque
            const newOrder = await prisma.$transaction(async (tx) => {
              const order = await tx.order.create({
                data: {
                    totalAmount: checkout.total,
                    amount: checkout.total,
                    status: 'paid',
                    addressId:checkout.address.id,
                    paymentProviderId: paymentId,
                    items: {
                        create: (checkout.cart as CartItem[]).map((item) => ({
                            quantity: item.quantity,
                            price: Math.round(item.price * 100),
                            variant: { connect: { sku: item.sku } },
                        })),
                    },
                },
                include: {
                  items: true,
                }
            }) as Order;

              for (const item of order.items) {
          
                  const inventoryUpdate = await tx.inventory.updateMany({
                      where: {
                          variantId: item.variantId,
                          quantity: {
                              gte: item.quantity,
                          },
                      },
                      data: {
                          quantity: {
                              decrement: item.quantity,
                          },
                      },
                  });
          
                  if (inventoryUpdate.count === 0) {
                      throw new Error(`Insufficient stock for SKU: ${item.variantId}.`);
                  }

                  await tx.stockMovement.create({
                    data: {
                      type: 'OUT',
                      quantity: item.quantity,
                      notes: `Venda - Pedido #${order.id}`,
                      variantId: item.variantId,
                    }
                  });
              }
          
              await tx.checkout.delete({
                  where: { id: checkout.id },
              });
          
              return order;
          });
          
      console.log(`Novo pedido ${newOrder.id} criado com o status PAGO.`);

      // --- INÍCIO DA INTEGRAÇÃO MELHOR ENVIO ---
      try {
        console.log(`Iniciando geração de etiqueta para o pedido ${newOrder.id}`);
        
        // 1. Adicionar ao carrinho
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItem = await addToCart(newOrder as any) as { id: string };
        console.log(`Pedido ${newOrder.id} adicionado ao carrinho do Melhor Envio com ID: ${cartItem.id}`);

        // 2. Comprar a etiqueta
        const purchase =(await checkoutCart([cartItem.id]))as MelhorEnvioPurchase;
        console.log(`Compra da etiqueta para o pedido ${newOrder.id} realizada com sucesso.`);
        console.log("Conteúdo do objeto 'purchase':", JSON.stringify(purchase, null, 2)); // DEBUG

        // 3. Gerar a etiqueta
        // A API de geração pode demorar um pouco, então esperamos um momento.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2 segundos
        const generated = await generateLabel(purchase.purchase.orders.map((o: MelhorEnvioOrder) => o.id));
        console.log(`Geração da etiqueta para o pedido ${newOrder.id} concluída.`);

        // 4. Obter URL de impressão
        // O objeto 'generated' tem a 'generate_key' e os IDs dos pedidos como chaves.
        // Filtramos para obter apenas os IDs dos pedidos.
        const orderIdsToPrint = Object.keys(generated as object).filter(key => key !== 'generate_key');

        const printInfo = await getLabelPrintUrl(orderIdsToPrint) as { url: string };
        const labelUrl = printInfo.url; // Correção: Acessar a URL diretamente do objeto

        // Extrair o código de rastreio da resposta da compra
        const trackingCode = purchase.purchase.orders[0]?.tracking;

        if (labelUrl || trackingCode) {
          // Encontrar ou criar o provedor de frete 'Melhor Envio'
          let melhorEnvioProvider = await prisma.shippingProvider.findUnique({
              where: { name: "Melhor Envio" },
          });

          if (!melhorEnvioProvider) {
              melhorEnvioProvider = await prisma.shippingProvider.create({
                  data: { name: "Melhor Envio" },
              });
          }

          // 5. Salvar URL da etiqueta e código de rastreio no Shipment
          await prisma.shipment.create({
            data: {
              orderId: newOrder.id,
              shippingProviderId: melhorEnvioProvider.id,
              providerShipmentId: purchase.purchase.orders[0]?.id, // Assuming this is the provider's shipment ID
              trackingCode: trackingCode,
              shippingLabelUrl: labelUrl,
            },
          });
          console.log(`URL da etiqueta e código de rastreio para o pedido ${newOrder.id} salvos no Shipment.`);
        } else {
          console.error(`Não foi possível obter a URL de impressão ou o código de rastreio para o pedido ${newOrder.id}`);
        }

      } catch (shippingError:unknown) {
         if (shippingError instanceof Error) {
          console.error(`ERRO AO GERAR ETIQUETA DE ENVIO para o pedido ${newOrder.id}:`, shippingError.message);
        } else {
          console.error(`ERRO AO GERAR ETIQUETA DE ENVIO para o pedido ${newOrder.id}:`, shippingError);
        }
        // Mesmo com erro no frete, o pedido foi criado. Você pode adicionar um status ou log para tratamento manual.
      }
      // --- FIM DA INTEGRAÇÃO MELHOR ENVIO ---
    }

    return NextResponse.json({ message: 'Webhook recebido com sucesso' }, { status: 200 });

  } catch (error: unknown) {
    console.error('Erro ao processar o webhook do Asaas:', error);
    if (error instanceof Error) {
      return NextResponse.json({
        message: 'Erro interno do servidor',
        error: error.message
      }, { status: 500 });
    }
    // Se não for um Error conhecido, registra o erro como está
    return NextResponse.json({
      message: 'Erro interno do servidor',
      error: 'Erro desconhecido'
    }, { status: 500 });
  }
};