
<!-- Adicionar ao Carrinho como Convidado:

No modelo Order, o campo userId é opcional (user User? @relation(fields: [userId], references: [id]) e userId String?).
Isso significa que você pode criar um registro de Order (que pode funcionar como o carrinho de compras) sem associá-lo a um User logado.
Adicionar um Endereço como Convidado:

Da mesma forma, no modelo Address, o campo userId também é opcional (user User? @relation(fields: [userId], references: [id]) e userId String?).
Você pode criar um Address para o convidado e associá-lo diretamente ao Order dele, sem precisar de um usuário.
Pedir Login no Momento do Pagamento:

Isso é implementado na lógica da sua aplicação. O fluxo seria:
O convidado navega, monta o carrinho (Order) e preenche o endereço (Address).
Ao clicar em "Confirmar Pagamento", sua aplicação verifica se o userId no registro do Order é nulo.
Se for nulo, você o redireciona para a página de login/cadastro.
Após o login/cadastro bem-sucedido, sua aplicação atualiza o Order e o Address existentes, preenchendo o campo userId com o ID do usuário que acabou de se autenticar. -->
<!-- 
comando util:

rm -rf node_modules .next package-lock.json
npm install -->


<!-- rm -rf node_modules .next package-lock.json && npm install -->

rm -rf .next node_modules
npm cache clean --force
npm install
npm run dev



npm install uuid
npm install @types/uuid --save-dev

npx prisma db push --force-reset  

ngrok http 3000


- Renomear coluna de produtos para quantidade acionada
- Cadastrar produtos corretamentes
- Atualizar o shchema - adcionei novas 
- Adcionar coluna de quantidade disponivel para caso haja vendas
- ALTERAR FOMULARIO DE CADASTO PARA ADcionar tamanho ,cumprimento ,dimensão e preço
- Adcionar a dunção helpers
- Adcionar no objeto do asas para que contemple o valor do frete
- Adcionar coluna de quantidade disponivel para caso haja vendas




- Banner Promocioanl 
- Cupom




Estoque
Cupom 
Frete


nova chave api :$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjdkZjYyMTM4LTc1OGItNDZmMy05NTkxLTJlNWVlZDkzMTVlMTo6JGFhY2hfYzhjNDM4ZDMtODFmZi00NWM3LThkMTEtODc4ZTE0ZWY1MDE4

Plano de Ação: Implementar Rastreamento com Webhook
Passo 1: Atualizar o Banco de Dados (Sua Ação Imediata)

O que fazer: Você precisa executar o comando npx prisma db push no seu terminal.
Por que: Isso irá adicionar a nova coluna melhorEnvioId à sua tabela de pedidos no banco de dados, um passo essencial para o que vem a seguir.
Passo 2: Salvar o ID do Melhor Envio

O que farei: Vou modificar o webhook que já existe (o do Asaas, em /api/webhooks/asaas/route.ts).
Por que: Quando uma etiqueta é criada no Melhor Envio, a API nos retorna um ID único para aquele envio. Vou capturar esse ID e salvá-lo no campo melhorEnvioId do seu pedido. É isso que nos permitirá conectar as duas pontas mais tarde.
Passo 3: Criar a Nova Rota para o Webhook do Melhor Envio

O que farei: Vou criar um novo arquivo e rota em /api/webhooks/melhor-envio/route.ts.
Por que: Este será o "endereço" para o qual o Melhor Envio enviará as atualizações automáticas, como a disponibilização do código de rastreio.
Passo 4: Implementar a Lógica do Novo Webhook

O que farei: Dentro dessa nova rota, vou escrever o código que:
Recebe a notificação do Melhor Envio.
Extrai o ID do envio e o código de rastreio.
Usa o melhorEnvioId para encontrar o pedido correspondente no seu banco de dados.
Finalmente, atualiza o pedido com o trackingCode e altera o status para "Enviado" (shipped).
Passo 5: Configuração no Painel do Melhor Envio (Sua Ação Final)

O que fazer: Após eu criar a rota, você precisará ir ao seu painel do Melhor Envio (no ambiente Sandbox) e configurar um novo webhook para apontar para a URL pública da rota que criei (ex: https://SEU_DOMINIO.ngrok-free.app/api/webhooks/melhor-envio).
Por que: Isso "diz" ao Melhor Envio para onde ele deve enviar as atualizações de rastreio.

