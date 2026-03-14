# OpenCloset E-commerce

[Português (BR) 🇧🇷](./README.md) | [English (US) 🇺🇸](./README.en.md)

**Complete fitness fashion e-commerce platform developed with Next.js, TypeScript and PostgreSQL.**

Modern full-stack system with complete admin panel, integrated checkout, shipping management, and optimized shopping experience.

---

### 🚀 Overview

OpenCloset is an e-commerce platform specialized in fitness fashion, offering:

- **Online Store** with product catalog, shopping cart and checkout
- **Admin Panel** for complete business management
- **Shipping System** integrated with automatic calculation
- **Payment Processing** via Asaas
- **Inventory Management** with stock control

---

### ✨ Main Features

#### 🛍️ Online Store (StoreFront)

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Listing with filters by category, price, size and color |
| **Product Page** | Image gallery, size/color selector, detailed description |
| **Shopping Cart** | Persisted in Redis (anonymous and logged sessions) |
| **Wishlist** | Saving favorite products |
| **Complete Checkout** | 3-step flow: identification → review → payment |
| **Discount Coupons** | Applicable by category, product or variation |

#### 👤 Customer Area

- **User Profile** - Personal data management
- **Address Management** - Multiple delivery addresses
- **Order History** - Purchase tracking and status
- **My Favorites** - Saved products for future purchase

#### 🎛️ Admin Panel

| Module | Features |
|--------|----------|
| **Dashboard** | Sales charts, statistics and recent sales |
| **Products** | Complete CRUD with variants (size/color), images and dimensions |
| **Categories** | Category hierarchy (parent/child) with archiving |
| **Orders** | Order viewing and management with status |
| **Coupons** | Coupon creation with fixed or percentage discount |
| **Banners** | Promotional banner upload and management |

---

### 🔧 Integrations and Technologies

#### Core Stack
```
Next.js 15.5.3      → React Framework with App Router
React 19.1.0        → UI Library
TypeScript 5        → Static typing
Tailwind CSS 4      → Utility-first styling
```

#### Database and ORM
```
PostgreSQL          → Relational database
Prisma 6.16.2       → Type-safe ORM
```

#### Authentication
```
Kinde Auth          → OAuth authentication (Google, GitHub, etc)
                    → User and session management
```

#### Session Storage
```
Upstash Redis       → Cart and session caching
                    → Real-time persistence
```

#### Image Upload
```
UploadThing         → Optimized image upload
                    → Integrated CDN
```

#### Payments
```
Asaas API           → Payment processing
                    → Transparent checkout
                    → Webhooks for confirmation
```

#### Shipping and Logistics
```
Melhor Envio API    → Shipping calculation
                    → Label generation
                    → Shipment tracking
```

#### UI/UX
```
Radix UI            → Accessible components (shadcn/ui)
Lucide React        → Modern icons
Recharts            → Charts and data visualization
Embla Carousel      → Product carousels
React Hook Form     → High-performance forms
Zod                 → Schema validation
```

---

### 📊 Data Model

The system manages complex inter-related entities:

- **Products** → Categories, Variants (Size/Color), Inventory, Dimensions
- **Orders** → Items, Address, Coupon, Payment, Shipment
- **Users** → Addresses, Favorites, Profile
- **Inventory** → In/Out stock movements

---

### 🏗️ Architecture

```
app/
├── (storeFront)/          # Store route group
│   ├── page.tsx            # Home (Hero, BestSellers, NewArrivals)
│   ├── product/            # Catalog and product details
│   ├── order-review/       # Checkout flow
│   └── user/               # Customer area
├── dashboard/              # Admin panel
│   ├── page.tsx            # Dashboard with statistics
│   ├── products/           # Product management
│   ├── categories/         # Category management
│   ├── orders/             # Order management
│   ├── coupons/            # Coupon management
│   └── banner/             # Banner management
├── api/                    # API Routes
│   ├── checkout/route.ts   # Checkout processing
│   ├── webhooks/asaas/     # Payment webhooks
│   └── uploadthing/        # Image upload
└── components/             # Shared components

lib/
├── prisma.ts               # Prisma Client
├── redis.ts                # Redis Client
├── melhor-envio.ts         # Melhor Envio Integration
├── uploadthing.ts          # UploadThing Config
└── action.ts               # Server Actions
```

---

### 🛠️ Running the Project

#### Prerequisites
- Node.js 18+
- PostgreSQL
- Kinde account (auth)
- Upstash account (Redis)
- UploadThing account
- Asaas account (sandbox/production)
- Melhor Envio account

#### Installation

```bash
# Clone the repository
git clone https://github.com/EwertonFS/OpenCloset-Ecommerce.git
cd OpenCloset-Ecommerce

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

#### Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm start            # Start in production
npm run lint         # ESLint
```

---

### 🔐 Environment Variables

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
# ... (sender data)
```

---

### 📱 Application Flows

#### Purchase Flow
```
Catalog → Product → Cart → Checkout → Payment → Confirmation
```

#### Order Processing Flow
```
Payment Confirmed (Webhook)
    ↓
Order Creation in Database
    ↓
Shipping Calculation (Melhor Envio)
    ↓
Label Generation
    ↓
Status Update
```

#### Administrative Flow
```
Dashboard → Product/Category Management
        → Orders → Shipping Labels
        → Coupons → Promotional Banners
```

---

### 💡 Technical Highlights

- **Server Actions** - Server operations without explicit API routes
- **Parallel Routes** - Parallel data loading
- **Streaming** - Progressive rendering with Suspense
- **Type Safety** - TypeScript throughout the stack
- **Caching** - Redis for sessions and data cache
- **Image Optimization** - Next.js Image + UploadThing CDN
- **Form Validation** - Zod + React Hook Form
- **Database** - Prisma with PostgreSQL

---

## 📞 Contact

Developed by [Ewerton](https://github.com/EwertonFS)

---

*Project developed with focus on performance, scalability and user experience.*
