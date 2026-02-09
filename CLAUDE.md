# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ma5zani is an e-commerce fulfillment platform for Algerian sellers. It's a trilingual (Arabic/English/French) Next.js application with RTL support, using Convex for real-time backend, Clerk for authentication, and Cloudflare R2 for image storage.

**Production URL**: https://www.ma5zani.com

## Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Production build
npm run lint         # Run ESLint
npx convex dev       # Start Convex dev server (syncs schema & functions)
npx convex deploy    # Deploy Convex to production
vercel --prod        # Deploy to Vercel production
```

**Development**: Run both `npm run dev` and `npx convex dev` in separate terminals for full functionality.

**Windows builds**: Use `set NODE_OPTIONS=--max-old-space-size=4096 && npm run build` to avoid segfaults during production builds.

## Architecture

### Tech Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS 3.4
- Convex (real-time backend)
- Clerk (authentication)
- Cloudflare R2 (image storage via presigned URLs)

### Key Features

1. **Seller Dashboard** (`/dashboard/*`) - Protected routes for managing products, orders, inventory, analytics
2. **Storefront Builder** (`/dashboard/storefront`) - Sellers create public boutique pages
3. **Public Storefronts** (`/[slug]`) - Customer-facing store pages with cart and checkout

### Route Structure

```
app/
  (storefront)/          # Route group for public storefronts
    [slug]/              # Dynamic storefront routes (e.g., /allouani)
      page.tsx           # Product listing
      product/[productId]/page.tsx  # Product detail with image gallery
      checkout/page.tsx  # Checkout form
      order-success/[orderId]/page.tsx
  dashboard/             # Protected seller dashboard
    storefront/          # Storefront builder
    products/            # Product management
    orders/              # Order management
  admin/                 # Admin panel (password protected)
```

### Convex Data Model

```typescript
sellers: { clerkId, email, name, phone?, businessAddress?, plan, isActivated?, activatedAt? }
products: { sellerId, name, sku, stock, price, status, imageKeys?, categoryId?, showOnStorefront?, salePrice? }
orders: { sellerId, productId, orderNumber, customerName, wilaya, amount, status, source?, storefrontId?, fulfillmentStatus? }
storefronts: { sellerId, slug, boutiqueName, logoKey?, theme, settings, metaPixelId?, isPublished }
categories: { sellerId, name, nameAr, sortOrder }
chats: { sessionId, recipientId?, recipientName?, recipientEmail?, status, lastMessageAt }
chatMessages: { chatId, sender, content, createdAt }

// AI Chatbot System
chatbots: { storefrontId, sellerId, name, greeting, personality, isEnabled }
chatbotKnowledge: { chatbotId, category, question, answer, keywords }
chatbotConversations: { chatbotId, storefrontId, sessionId, customerName?, status, context? }
chatbotMessages: { conversationId, sender, content, metadata? }
```

- Product `status` auto-updates based on stock: `active` (>10), `low_stock` (1-10), `out_of_stock` (0)
- `imageKeys` are R2 storage keys (strings), not Convex storage IDs

### Image Storage (R2)

Images are stored in Cloudflare R2, not Convex storage:
- Upload flow: Client → `/api/upload` (get presigned URL) → PUT to R2
- Display: `getR2PublicUrl(key)` from `lib/r2.ts`
- Keys stored as strings in `imageKeys` (products) or `logoKey` (storefronts)

### Authentication Flow

1. User signs up via Clerk (`/signup`)
2. Redirected to `/onboarding` to select plan
3. `upsertSeller` mutation creates seller record in Convex
4. Dashboard queries require authenticated seller via `requireSeller()`
5. Public storefront routes (`/[slug]`) don't require auth

**Clerk Production Setup**: Auth domain is `clerk.ma5zani.com`. The Convex auth config (`convex/auth.config.ts`) uses `CLERK_ISSUER_URL` env var with fallback to production domain.

### Middleware Logic

`middleware.ts` distinguishes between:
- Reserved paths (`dashboard`, `login`, `admin`, etc.) - standard auth rules
- Dynamic slugs (`/[slug]`) - treated as public storefront routes

### Internationalization (i18n)

Three languages: Arabic (ar), English (en), French (fr). `Language` type defined in `lib/translations.ts`.

- `useLanguage()` hook provides `{ language, setLanguage, t, dir }`
- Default language is Arabic with RTL layout. English and French are LTR.
- Language persisted in localStorage as `ma5zani-lang`

**Two translation patterns exist:**
1. **Dashboard/landing pages**: `t.section.key` from the translations object (e.g., `t.dashboard.orders`)
2. **Storefront components**: `localText(language, { ar: '...', en: '...', fr: '...' })` for inline trilingual text

When adding new text, use `t.section.key` if translations are in `lib/translations.ts`, or `localText()` for storefront component inline text. All three languages must be provided.

**Key files**: `lib/translations.ts` (~500+ keys per language), `lib/LanguageContext.tsx` (provider), `components/ui/LanguageToggle.tsx` (3-way toggle)

### Cart System

- `useCart()` hook from `lib/CartContext.tsx`
- Persisted to localStorage as `ma5zani-cart`
- Tied to specific storefront via `storefrontSlug`

### Brand Colors

- Deep Blue: `#0054A6` (primary)
- Bright Blue: `#00AEEF`
- Orange: `#F7941D` (CTA buttons)
- Green: `#22B14C` (success states)

### Fonts

- **Outfit**: Display/headings (`--font-outfit`)
- **Plus Jakarta Sans**: Body text (`--font-plus-jakarta`)
- **Cairo**: Arabic text (`--font-cairo`)

### Convex Functions

Protected functions use `requireSeller()` from `convex/auth.ts`. Public functions (for storefronts) are in `convex/publicOrders.ts`:
- `getStorefrontProducts` - Public product listing
- `getPublicProduct` - Single product with related products
- `createPublicOrder` - Order creation without auth

### Meta Pixel Integration

Storefronts support Meta Pixel for conversion tracking:
- Pixel ID configured in `/dashboard/storefront` settings
- Script injected via `StorefrontLayout.tsx`
- Events tracked: `PageView`, `InitiateCheckout`, `Purchase`

### Support Chat System

Real-time human support chat for customers:
- Chat functions in `convex/chat.ts` (public user functions + admin functions)
- Admin functions require password validation (hardcoded fallback: `csgo2026`)
- Anonymous users identified by `sessionId` stored in localStorage
- Admin panel at `/admin/chats` for managing conversations

### Admin Panel

Password-protected admin panel at `/admin/*`:
- Login at `/admin` with password stored in sessionStorage
- Dashboard, sellers, orders, products, and support chats management
- Admin password: `csgo2026` (also set as `ADMIN_PASSWORD` env var in Convex)

### AI Chatbot System

Each seller can enable an AI-powered chatbot for their storefront:
- **Dashboard pages** (`/dashboard/chatbot/*`): Settings, training, knowledge base, live chats
- **Storefront widget** (`ChatbotWidget.tsx`): Floating chat button on customer-facing stores
- **AI backend** (`lib/ai.ts`, `/api/chatbot`): OpenRouter integration with Claude 3.5 Haiku
- **Convex functions** (`convex/chatbot.ts`): Seller management + public customer functions

**Key flows**:
- Sellers train the bot via chat-based Q&A in `/dashboard/chatbot/training`
- Knowledge stored in `chatbotKnowledge` table with keywords for matching
- AI generates responses using product catalog + trained knowledge as context
- Sellers can takeover conversations (handoff) and return control to bot
- Support chat (ma5zani's) only shows on home/dashboard, not on storefronts

### Founder Offer / Activation Gate

Storefront and AI chatbot features are locked behind `seller.isActivated`. Flow:
1. New sellers get `isActivated: false` on signup
2. Seller pays 4,000 DA/year, sends proof via WhatsApp
3. Admin activates seller via `/admin/sellers` (toggles `isActivated` + sets `activatedAt`)
4. Gated pages: `/dashboard/storefront/*`, `/dashboard/chatbot/*` — show `FounderOfferGate` component if not activated
5. Dashboard shows orange unlock banner for non-activated sellers
6. Pricing is hardcoded in: `lib/translations.ts` (founderOffer section), `app/onboarding/page.tsx`, `components/landing/Pricing.tsx`

### Storefront Templates

Templates are in `lib/templates/`. Each template defines sections, colors, and footer config:
- `shopify.ts` - Full-featured layout (hero, features, categories, grid) — the default
- `minimal.ts` - Simple product-only layout
- `themes.ts` - 6 color-themed variants that reuse shopify sections with different palettes (Elegant Dark, Ocean Breeze, Rose Gold, Forest, Sunset, Slate Pro)
- `index.ts` - Registry of all templates, `TemplateConfig` interface, `getTemplate()` helper

The storefront header (`components/storefront/StorefrontHeader.tsx`) uses `dir={isRTL ? 'rtl' : 'ltr'}` on the container for proper flex direction in Arabic. On mobile it shows SVG line icons instead of text labels.

### Important Patterns

**Tailwind Dynamic Classes**: Use inline styles for dynamic colors (e.g., toggle switches) because Tailwind purges dynamically constructed classes in production builds.

**Convex Development**: Always run `npx convex dev` alongside `npm run dev` to sync schema changes and regenerate types.

**Mobile-First**: Components use `sm:` and `lg:` breakpoints. Test mobile views when editing dashboard/storefront pages.

**Component Organization**:
- `components/ui/` - Reusable primitives (Button, Input, Card, Badge)
- `components/dashboard/` - Seller dashboard components (DashboardLayout, Sidebar, StatsCards)
- `components/storefront/` - Public store components (ProductCard, CartDrawer, CheckoutForm)
- `components/storefront-builder/` - Storefront editor tabs (BrandingSection, ThemeSection, SettingsSection)
- `components/landing/` - Landing page sections

### Environment Variables

**Vercel (Production)**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk production key (pk_live_...)
- `CLERK_SECRET_KEY` - Clerk secret (sk_live_...)
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `R2_*` - Cloudflare R2 credentials

**Convex**:
- `CLERK_ISSUER_URL` - Set to `https://clerk.ma5zani.com` for production
- `ADMIN_PASSWORD` - Admin panel access password

**AI Chatbot**:
- `OPENROUTER_API_KEY` - OpenRouter API key for Claude 3.5 Haiku (set in Vercel)
