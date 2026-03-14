# OpenCloset E-commerce

[Português (BR) 🇧🇷](./README.md) | [English (US) 🇺🇸](./README.en.md)

**Plataforma completa de e-commerce para moda fitness desenvolvida com Next.js, TypeScript e PostgreSQL.**

Sistema fullstack moderno com painel administrativo completo, checkout integrado, gestão de frete e experiência de compra otimizada.

---

### 🚀 Visão Geral

OpenCloset é uma plataforma de e-commerce especializada em moda fitness, oferecendo:

- **Loja virtual** com catálogo de produtos, carrinho e checkout
- **Painel administrativo** para gestão completa do negócio
- **Sistema de frete** integrado com cálculo automático via Melhor Envio
- **Processamento de pagamentos** via Asaas
- **Gerenciamento de inventário** com controle de estoque rigoroso

---

### ✨ Funcionalidades Principais

#### 🛍️ Loja Virtual (StoreFront)

| Funcionalidade | Descrição |
|---------------|-----------|
| **Catálogo de Produtos** | Listagem com filtros por categoria, preço, tamanho e cor |
| **Página do Produto** | Galeria de imagens, seletor de tamanho/cor, descrição detalhada |
| **Carrinho de Compras** | Persistido no Redis (sessão anônima e logada) |
| **Lista de Favoritos** | Salvamento de produtos preferidos |
| **Checkout Completo** | Fluxo em 3 etapas: identificação → revisão → pagamento |
| **Cupons de Desconto** | Aplicável por categoria, produto ou variação |

#### 👤 Área do Cliente

- **Perfil do Usuário** - Gerenciamento de dados pessoais
- **Gerenciamento de Endereços** - Múltiplos endereços de entrega
- **Histórico de Pedidos** - Acompanhamento de compras e status em tempo real
- **Meus Favoritos** - Produtos salvos para compra futura

#### 🎛️ Painel Administrativo

| Módulo | Funcionalidades |
|--------|----------------|
| **Dashboard** | Gráficos de vendas, estatísticas e vendas recentes |
| **Produtos** | CRUD completo com variantes (tamanho/cor), imagens e dimensões |
| **Categorias** | Hierarquia de categorias (pai/filho) com arquivamento |
| **Pedidos** | Visualização e gestão de pedidos com status |
| **Cupons** | Criação de cupons com desconto fixo ou percentual |
| **Banners** | Upload e gerenciamento de banners promocionais |

---

### 🔧 Integrações e Tecnologias

#### Core Stack
```
Next.js 15.5.3      → Framework React com App Router
React 19.1.0        → Biblioteca UI
TypeScript 5        → Tipagem estática
Tailwind CSS 4      → Estilização utilitária
```

#### Banco de Dados e ORM
```
PostgreSQL          → Banco de dados relacional
Prisma 6.16.2       → ORM type-safe
```

#### Autenticação
```
Kinde Auth          → Autenticação OAuth (Google, GitHub, etc)
                    → Gestão de usuários e sessões
```

#### Armazenamento de Sessão
```
Upstash Redis       → Cache de carrinhos e sessões
                    → Persistência em tempo real
```

#### Upload de Imagens
```
UploadThing         → Upload otimizado de imagens
                    → CDN integrado
```

#### Pagamentos
```
Asaas API           → Processamento de pagamentos
                    → Checkout transparente
                    → Webhooks para confirmação
```

#### Frete e Logística
```
Melhor Envio API    → Cálculo de frete
                    → Geração de etiquetas
                    → Rastreamento de envios
```

#### UI/UX
```
Radix UI            → Componentes acessíveis (shadcn/ui)
Lucide React        → Ícones modernos
Recharts            → Gráficos e visualização de dados
Embla Carousel      → Carrosséis de produtos
React Hook Form     → Formulários performáticos
Zod                 → Validação de schemas
```

---

### 📊 Modelo de Dados

O sistema gerencia entidades complexas inter-relacionadas:

- **Produtos** → Categorias, Variantes (Tamanho/Cor), Inventário, Dimensões
- **Pedidos** → Itens, Endereço, Cupom, Pagamento, Envio
- **Usuários** → Endereços, Favoritos, Perfil
- **Estoque** → Movimentações de entrada/saída

---

### 🏗️ Arquitetura

```
app/
├── (storeFront)/          # Grupo de rotas da loja
│   ├── page.tsx            # Home (Hero, BestSellers, NewArrivals)
│   ├── product/            # Catálogo e detalhes do produto
│   ├── order-review/       # Fluxo de checkout
│   └── user/               # Área do cliente
├── dashboard/              # Painel administrativo
│   ├── page.tsx            # Dashboard com estatísticas
│   ├── products/           # Gestão de produtos
│   ├── categories/         # Gestão de categorias
│   ├── orders/             # Gestão de pedidos
│   ├── coupons/            # Gestão de cupons
│   └── banner/             # Gestão de banners
├── api/                    # API Routes
│   ├── checkout/route.ts   # Processamento de checkout
│   ├── webhooks/asaas/     # Webhook de pagamentos
│   └── uploadthing/        # Upload de imagens
└── components/             # Componentes compartilhados

lib/
├── prisma.ts               # Cliente Prisma
├── redis.ts                # Cliente Redis
├── melhor-envio.ts         # Integração Melhor Envio
├── uploadthing.ts          # Config UploadThing
└── action.ts               # Server Actions
```

---

### 🛠️ Executando o Projeto

#### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta Kinde (auth)
- Conta Upstash (Redis)
- Conta UploadThing
- Conta Asaas (sandbox/produção)
- Conta Melhor Envio

#### Instalação

```bash
# Clone o repositório
git clone https://github.com/EwertonFS/OpenCloset-Ecommerce.git
cd OpenCloset-Ecommerce

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute as migrações do Prisma
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# Inicie o servidor de desenvolvimento
npm run dev
```

#### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm start            # Iniciar em produção
npm run lint         # ESLint
```

---

### 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Kinde Auth
KINDE_CLIENT_ID="..."
KINDE_CLIENT_SECRET="..."
KINDE_ISSUER_URL="..."
KINDE_SITE_URL="..."
KINDE_POST_LOGOUT_REDIRECT_URL="..."
KINDE_POST_LOGIN_REDIRECT_URL="..."

# Redis (Upstash)
REDIS_URL="..."
REDIS_TOKEN="..."

# UploadThing
UPLOADTHING_TOKEN="..."

# Asaas Payment
ASAAS_API_KEY="..."
ASAAS_WEBHOOK_SECRET="..."

# Melhor Envio
MELHOR_ENVIO_API_TOKEN="..."
MELHOR_ENVIO_API_URL="..."
MELHOR_ENVIO_SENDER_NAME="..."
# ... (dados do remetente)
```

---

### 📱 Fluxos da Aplicação

#### Fluxo de Compra
```
Catálogo → Produto → Carrinho → Checkout → Pagamento → Confirmação
```

#### Fluxo de Processamento de Pedido
```
Pagamento Confirmado (Webhook)
    ↓
Criação do Pedido no Banco
    ↓
Cálculo do Frete (Melhor Envio)
    ↓
Geração de Etiqueta
    ↓
Atualização de Status
```

#### Fluxo Administrativo
```
Dashboard → Gestão de Produtos/Categorias
        → Pedidos → Etiquetas de Envio
        → Cupons → Banners Promocionais
```

---

### 💡 Destaques Técnicos

- **Server Actions** - Operações no servidor sem API routes explícitas
- **Parallel Routes** - Carregamento paralelo de dados
- **Streaming** - Renderização progressiva com Suspense
- **Type Safety** - TypeScript em toda a stack
- **Caching** - Redis para sessões e cache de dados
- **Image Optimization** - Next.js Image + UploadThing CDN
- **Form Validation** - Zod + React Hook Form
- **Database** - Prisma com PostgreSQL

---

## 📞 Contato

Desenvolvido por [Ewerton](https://github.com/EwertonFS)

---

*Projeto desenvolvido com foco em performance, escalabilidade e experiência do usuário.*
