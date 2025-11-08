
import { Order } from "@prisma/client";
import { prisma } from "./prisma";

const MELHOR_ENVIO_API_URL = process.env.MELHOR_ENVIO_API_URL || 'https://sandbox.melhorenvio.com.br/api/v2/me';
const MELHOR_ENVIO_API_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;

// Dados do remetente (Sua loja) - idealmente vindos de variáveis de ambiente
const from = {
    name: process.env.MELHOR_ENVIO_SENDER_NAME,
    phone: process.env.MELHOR_ENVIO_SENDER_PHONE,
    email: process.env.MELHOR_ENVIO_SENDER_EMAIL,
    document: process.env.MELHOR_ENVIO_SENDER_DOCUMENT, // CPF/CNPJ
    company_document: process.env.MELHOR_ENVIO_SENDER_COMPANY_DOCUMENT, // CNPJ
    state_register: process.env.MELHOR_ENVIO_SENDER_STATE_REGISTER, // Inscrição Estadual
    address: process.env.MELHOR_ENVIO_SENDER_ADDRESS,
    complement: process.env.MELHOR_ENVIO_SENDER_COMPLEMENT,
    number: process.env.MELHOR_ENVIO_SENDER_NUMBER,
    district: process.env.MELHOR_ENVIO_SENDER_DISTRICT,
    city: process.env.MELHOR_ENVIO_SENDER_CITY,
    state_abbr: process.env.MELHOR_ENVIO_SENDER_STATE_ABBR,
    country_id: process.env.MELHOR_ENVIO_SENDER_COUNTRY_ID || 'BR',
    postal_code: process.env.MELHOR_ENVIO_SENDER_POSTAL_CODE,
    note: process.env.MELHOR_ENVIO_SENDER_NOTE,
};

/**
 * Função genérica para fazer requisições à API do Melhor Envio
 */
async function apiRequest(endpoint: string, options: RequestInit): Promise<unknown> {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_API_TOKEN}`,
        'User-Agent': 'E-commerce Foxfit (seu_email@exemplo.com)', // Substitua pelo seu e-mail
    };

    const response = await fetch(`${MELHOR_ENVIO_API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error: { message?: string } = await response.json();
        console.error(`Erro ao chamar a API do Melhor Envio no endpoint ${endpoint}:`, error);
        throw new Error(`Erro na API do Melhor Envio: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Adiciona um frete ao carrinho de compras do Melhor Envio.
 */
export async function addToCart(order: Order) {
    // 1. Buscar os itens do pedido e suas dimensões
    const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            dimensions: true,
                            product: true,
                        }
                    }
                }
            },
            address: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!orderWithDetails) {
        throw new Error("Pedido não encontrado para adicionar ao carrinho do Melhor Envio.");
    }

    // DEBUG: Log para verificar se as dimensões estão sendo carregadas
    console.log("Detalhes do pedido para Melhor Envio (verificar dimensões):", JSON.stringify(orderWithDetails.items, null, 2));

    // 2. Preparar o payload para a API
    const payload = {
        service: 2, // TODO: Obter o método de envio (service_id) que o cliente escolheu no checkout. 2 = Jadlog .Package
        agency: 4, // TODO: Obter a agência de postagem, se aplicável.
        from,
        to: {
            name: `${orderWithDetails.address.user.firstName} ${orderWithDetails.address.user.lastName}`,
            phone: orderWithDetails.address.user.phone,
            email: orderWithDetails.address.user.email,
            document: orderWithDetails.address.user.cpf,
            address: orderWithDetails.address.street,
            complement: orderWithDetails.address.complement,
            number: orderWithDetails.address.number,
            district: orderWithDetails.address.district, // Usando o novo campo 'bairro'
            city: orderWithDetails.address.city,
            state_abbr: orderWithDetails.address.state,
            country_id: 'BR',
            postal_code: orderWithDetails.address.zipCode,
        },
        products: orderWithDetails.items.map(item => ({
            name: item.variant.product.name,
            quantity: item.quantity,
            unitary_value: item.price / 100,
        })),
        volumes: (() => {
            let totalWeight = 0;
            orderWithDetails.items.forEach(item => {
                totalWeight += item.variant.dimensions?.weight || 0;
            });

            // Definir um tamanho de pacote padrão consolidado que respeite o limite de 200cm
            // Estes valores devem ser ajustados com base nos tamanhos reais das suas embalagens.
            const defaultPackageHeight = 10; // cm
            const defaultPackageWidth = 20;  // cm
            const defaultPackageLength = 30; // cm
            const defaultPackageWeight = totalWeight > 0 ? totalWeight : 0.1; // Usar peso total ou mínimo

            return [{
                height: defaultPackageHeight,
                width: defaultPackageWidth,
                length: defaultPackageLength,
                weight: defaultPackageWeight,
            }];
        })(),
        options: {
            insurance_value: orderWithDetails.totalAmount / 100,
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: true, // Mude para `false` se for usar Nota Fiscal
            // invoice: { key: "SUA_CHAVE_NFE" } // Adicione a chave da NFe aqui
        },
    };

    // 3. Chamar a API
    console.log("Enviando para o carrinho do Melhor Envio:", JSON.stringify(payload, null, 2));
    const cartItem = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return cartItem;
}

/**
 * Efetua a compra (checkout) dos itens no carrinho.
 */
export async function checkoutCart(cartItemIds: string[]) {
    const payload = {
        orders: cartItemIds,
    };

    const result = await apiRequest('/shipment/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return result;
}

/**
 * Gera as etiquetas para os pedidos comprados.
 */
export async function generateLabel(orderIds: string[]) {
    const payload = {
        orders: orderIds,
    };

    const result = await apiRequest('/shipment/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return result;
}

/**
 * Obtém o link de impressão para as etiquetas geradas.
 */
export async function getLabelPrintUrl(orderIds: string[]) {
    const payload = {
        mode: 'private', // ou 'public'
        orders: orderIds,
    };

    const result = await apiRequest('/shipment/print', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    // A URL de impressão geralmente vem no campo `url` da resposta
    return result;
}
