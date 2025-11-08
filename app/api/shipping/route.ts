import { NextResponse } from 'next/server';

interface Product {
  id: string | number;
  weight: number;
  width: number;
  height: number;
  length: number;
  quantity: number;
  price?: number;
  insurance_value?: number;
}

interface Rate {
  id: number;
  name: string;
  price?: string;
  error?: string;
}

export async function POST(request: Request) {
  const { to_postal_code, products }: { to_postal_code: string; products: Product[] } = await request.json();
  // console.log("PASSO 1: Requisição recebida em /api/shipping com os dados:", { to_postal_code, products });

  const cleanedPostalCode = to_postal_code.replace(/\D/g, '');

  if (!cleanedPostalCode || cleanedPostalCode.length !== 8) {
    // console.error('ERRO: CEP inválido recebido:', to_postal_code);
    return NextResponse.json({ error: 'CEP inválido.' }, { status: 400 });
  }
  const MELHOR_ENVIO_API_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;
  const from_postal_code = process.env.FROM_POSTAL_CODE || '49020680';

  if (!MELHOR_ENVIO_API_TOKEN) {
    // console.error('ERRO: A variável de ambiente MELHOR_ENVIO_TOKEN não está definida.');
    return NextResponse.json({ error: 'Erro de configuração interna do servidor.' }, { status: 500 });
  }

  // Garante que cada produto tenha o campo obrigatório insurance_value
  const productsWithInsurance = products.map((product: Product) => ({
    ...product,
    // A API exige insurance_value. Usamos o valor do produto, ou o próprio insurance_value se já vier, ou 0 como fallback.
    insurance_value: product.insurance_value ?? product.price ?? 0,
  }));

  const requestBody = {
    from: { postal_code: from_postal_code },
    to: { postal_code: cleanedPostalCode },
    products: productsWithInsurance,
  };

  console.log("PASSO 2: Enviando os seguintes dados para a API do Melhor Envio:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MELHOR_ENVIO_API_TOKEN}`,
        'User-Agent': 'Foxfit (ewerton.businees@gmail.com)',
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.text();
    // console.log("PASSO 3: Resposta recebida do Melhor Envio (em texto):", responseBody);

    if (!response.ok) {
      // console.error('ERRO na API do Melhor Envio:', { status: response.status, body: responseBody });
      return NextResponse.json({ error: 'Não foi possível calcular o frete.', details: responseBody }, { status: response.status });
    }

    const parsedData: unknown = JSON.parse(responseBody);
    const data: Rate[] = parsedData as Rate[];
    // console.log("PASSO 4: Dados da resposta (JSON parseado):", data);

    const validRates = data.filter((rate: Rate) => rate.price && !rate.error);
    // console.log("PASSO 5: Opções de frete válidas que serão enviadas para o front-end:", validRates);

    return NextResponse.json(validRates);

  } catch (error) {
    // console.error('ERRO CRÍTICO ao tentar conectar com o Melhor Envio:', error);
    return NextResponse.json({ error: 'Erro interno ao calcular o frete.' }, { status: 500 });
  }
}
