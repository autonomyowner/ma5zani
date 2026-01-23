# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ma5zani is an e-commerce fulfillment platform for Algerian sellers. It's a bilingual (Arabic/English) Next.js application with RTL support, using Convex for real-time backend and Clerk for authentication.

## Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Production build
npm run lint         # Run ESLint
npx convex dev       # Start Convex dev server (syncs schema & functions)
npx convex deploy    # Deploy Convex to production
```

## Architecture

### Tech Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS 3.4
- Convex (real-time backend)
- Clerk (authentication)

### Directory Structure
```
app/
  layout.tsx           # Root layout with Providers wrapper
  providers.tsx        # ClerkProvider + ConvexProviderWithClerk + LanguageProvider
  page.tsx             # Landing page (marketing)
  login/page.tsx       # Clerk SignIn component
  signup/page.tsx      # Clerk SignUp component
  onboarding/page.tsx  # Post-signup plan selection
  dashboard/page.tsx   # Seller dashboard (protected)
components/
  ui/                  # Reusable UI primitives (Button, Input, Card, Badge)
  landing/             # Marketing page sections
  dashboard/           # Dashboard components (Sidebar, StatsCards, OrdersTable, ProductsList)
convex/
  schema.ts            # Database schema (sellers, products, orders)
  auth.ts              # Auth helpers (getCurrentSeller, requireSeller)
  auth.config.ts       # Clerk JWT integration config
  sellers.ts           # Seller queries and mutations
  products.ts          # Product CRUD with auto stock status
  orders.ts            # Order management
  stats.ts             # Dashboard statistics
lib/
  LanguageContext.tsx  # Language state management (ar/en toggle)
  translations.ts      # All UI text in Arabic and English
middleware.ts          # Clerk route protection
```

### Authentication Flow
1. User signs up via Clerk (`/signup`)
2. Redirected to `/onboarding` to select plan
3. `upsertSeller` mutation creates seller record in Convex
4. Dashboard queries require authenticated seller via `requireSeller()`

### Convex Data Model
```typescript
sellers: { clerkId, email, name, phone?, businessAddress?, plan }
products: { sellerId, name, sku, stock, price, status, description? }
orders: { sellerId, productId, orderNumber, customerName, wilaya, amount, status }
```

Product status auto-updates based on stock: `active` (>10), `low_stock` (1-10), `out_of_stock` (0)

### Internationalization (i18n)
- `useLanguage()` hook provides `{ language, setLanguage, t }`
- Access translations via `t.section.key` pattern
- Default language is Arabic with RTL layout
- Language persisted in localStorage as `ma5zani-lang`

### Brand Colors (tailwind.config.ts)
- Deep Blue: `#0054A6` (primary)
- Bright Blue: `#00AEEF`
- Orange: `#F7941D` (CTA buttons)
- Green: `#22B14C` (success states)

### Fonts
- **Outfit**: Display/headings (`--font-outfit`)
- **Plus Jakarta Sans**: Body text (`--font-plus-jakarta`)
- **Cairo**: Arabic text (`--font-cairo`)
