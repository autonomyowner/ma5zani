# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ma5zani is an e-commerce store builder for Algerian sellers — positioned as the Shopify alternative for Algeria. It's a trilingual (Arabic/English/French) Next.js application with RTL support, using Convex for real-time backend, better-auth for authentication, and Cloudflare R2 for image storage. Sellers create online stores in minutes with professional templates, AI chatbot, unlimited products, and instant order notifications.

**Production URL**: https://www.ma5zani.com

## Deployment Rule (MANDATORY)

**When the user asks to push, deploy, commit, or ship changes, Claude Code MUST follow this exact sequence:**

1. Check if ANY file under `convex/` was modified (schema, mutations, queries, actions, http, auth)
2. **If yes** → run `npx convex deploy --yes` FIRST, wait for it to succeed, THEN commit & push to `main`
3. **If no** → commit & push to `main` directly
4. GitHub Actions will auto-deploy the frontend to Cloudflare Workers after the push

**Never skip step 1.** A mismatch between the Convex backend and the Cloudflare Workers frontend causes runtime crashes on the live site. When in doubt, always run `npx convex deploy --yes` before pushing — it's safe to run even if nothing changed.

## Hosting & Deployment

Hosted on **Cloudflare Workers** via `@opennextjs/cloudflare`. Previously hosted on Vercel (migrated Feb 2025).

```bash
npm run dev          # Start Next.js development server
npm run build        # Production build (Next.js only)
npm run lint         # Run ESLint
npm run preview      # Build + run locally on Workers runtime (wrangler dev)
npm run deploy       # Build + deploy to Cloudflare Workers production
npx convex dev       # Start Convex dev server (syncs schema & functions)
npx convex deploy    # Deploy Convex to production
```

**Development**: Run both `npm run dev` and `npx convex dev` in separate terminals for full functionality.

**Windows builds**: Use `set NODE_OPTIONS=--max-old-space-size=4096 && npm run build` to avoid segfaults during production builds.

**CI/CD**: GitHub Actions auto-deploys to Cloudflare Workers on push to `main` (`.github/workflows/deploy.yml`). Requires `CLOUDFLARE_API_TOKEN` secret in GitHub repo settings.

**CRITICAL — Always deploy Convex when deploying Workers**: If you modify ANY file under `convex/` (schema, mutations, queries) you MUST run `npx convex deploy --yes` BEFORE or alongside `npm run deploy`. The Cloudflare Workers deploy does NOT deploy Convex — they are separate deployments. A mismatch between the Workers frontend and the Convex backend causes runtime `Server Error` crashes (e.g. schema expects fields that don't exist, or queries reference changed types). When in doubt, always run both:
```bash
npx convex deploy --yes && npm run deploy
```

**CRITICAL — `.env.local` overrides `.env.production` in Next.js builds**: `NEXT_PUBLIC_*` vars are baked in at build time. The `.env.local` file has the **dev** Convex URL (`effervescent-dachshund-947`), while `.env.production` has the **production** URL (`colorless-cricket-513`). Since `.env.local` takes priority, running `npm run deploy` locally will bake the dev URL into production — causing the site to query an empty dev database.

**To deploy locally, always rename `.env.local` first:**
```bash
mv .env.local .env.local.bak
set NODE_OPTIONS=--max-old-space-size=4096 && npm run deploy
mv .env.local.bak .env.local
```

**Preferred: deploy via `git push` to `main`** — CI/CD (`.github/workflows/deploy.yml`) has the correct production env vars hardcoded and is not affected by `.env.local`.

**Two Convex deployments:**
- **Dev**: `effervescent-dachshund-947` — used by `npx convex dev` and local `npm run dev`
- **Production**: `colorless-cricket-513` — used by `npx convex deploy` and the live site
- `npx convex deploy` always targets production regardless of `.env.local`

**tsconfig**: `ma5zani_mobile` and `ma5zani-mobile-v2` directories are excluded in `tsconfig.json`. If adding new non-Next.js directories, add them to the exclude list to prevent build failures.

## Architecture

### Tech Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS 3.4
- Convex (real-time backend)
- better-auth with `@convex-dev/better-auth` (authentication — email/password + Google OAuth)
- Cloudflare Workers (hosting via `@opennextjs/cloudflare`)
- Cloudflare R2 (image storage via `aws4fetch` presigned URLs)
- Resend (transactional email notifications)

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
sellers: { email, name, phone?, businessAddress?, plan, isActivated?, activatedAt?, expoPushToken?, emailNotifications? }
products: { sellerId, name, sku, stock, price, status, imageKeys?, categoryId?, showOnStorefront?, salePrice? }
orders: { sellerId, productId, orderNumber, customerName, wilaya, amount, status, source?, storefrontId?, fulfillmentStatus? }
storefronts: { sellerId, slug, boutiqueName, logoKey?, theme, settings, metaPixelId?, customDomain?, isPublished }
customDomains: { storefrontId, sellerId, hostname, cloudflareHostnameId?, status, validationErrors?, sslStatus? }
categories: { sellerId, name, nameAr, sortOrder }
chats: { sessionId, recipientId?, recipientName?, recipientEmail?, status, lastMessageAt }
chatMessages: { chatId, sender, content, createdAt }

// AI Chatbot System
chatbots: { storefrontId, sellerId, name, greeting, personality, isEnabled }
chatbotKnowledge: { chatbotId, category, question, answer, keywords }
chatbotConversations: { chatbotId, storefrontId, sessionId, customerName?, status, context? }
chatbotMessages: { conversationId, sender, content, metadata? }

// Telegram Bot
telegramLinks: { sellerId, telegramUserId, status, verificationCode? }
telegramSessions: { telegramUserId, sellerId, command, step, data }
```

- Product `status` auto-updates based on stock: `active` (>10), `low_stock` (1-10), `out_of_stock` (0)
- `imageKeys` are R2 storage keys (strings), not Convex storage IDs
- `clerkId` field on sellers is deprecated (optional, from pre-migration)

### Image Storage (R2)

Images are stored in Cloudflare R2, not Convex storage:
- Upload flow: Client → `/api/upload` (get presigned URL via `aws4fetch`) → PUT to R2
- Display: `getR2PublicUrl(key)` from `lib/r2.ts`
- Keys stored as strings in `imageKeys` (products) or `logoKey` (storefronts)
- Server-side uploads (Telegram): `lib/r2-server.ts` uses `aws4fetch` with `Uint8Array` body

### Authentication (better-auth)

Auth was migrated from Clerk to `@convex-dev/better-auth`. Supports email/password + Google OAuth.

**Key files**:
- `convex/auth.ts` - `authComponent`, `createAuth()`, `getAuthenticatedSeller()`, `requireSeller()`
- `convex/auth.config.ts` - Auth config provider for Convex
- `convex/http.ts` - Auth routes registered via `authComponent.registerRoutes()` + CORS preflight handlers
- `convex/convex.config.ts` - Registers better-auth component
- `lib/auth-client.ts` - Frontend auth client (no `baseURL` — uses same-origin `/api/auth/*`)
- `lib/auth-server.ts` - Server-side auth utilities via `convexBetterAuthNextJs()`
- `app/api/auth/[...all]/route.ts` - Next.js auth API handler

**Flow**:
1. User signs up at `/signup` (email/password or Google OAuth)
2. Redirected to `/onboarding` to select plan
3. `upsertSeller` mutation creates seller record matched by email
4. Dashboard queries require authenticated seller via `requireSeller()`
5. Public storefront routes (`/[slug]`) don't require auth

**Important**: `authComponent.getAuthUser(ctx)` throws when unauthenticated — always wrap in try-catch (see `getAuthenticatedSeller` in `convex/auth.ts`). Do NOT set `baseURL` in the frontend auth client to avoid CORS issues.

### Middleware Logic

`middleware.ts` handles routing for multiple domain types:

1. **Non-www redirect**: `ma5zani.com` → `www.ma5zani.com` (301)
2. **Main site passthrough**: `www.ma5zani.com` and `localhost`
3. **Subdomain rewrite**: `store.ma5zani.com/path` → rewrite to `/store/path` (free for all sellers)
4. **Custom domain resolution**: `mystore.com/path` → query Convex for slug → rewrite to `/slug/path` (in-memory 5min cache)

Reserved subdomains that pass through: `www`, `api`, `admin`, `dashboard`, `mail`, `smtp`, `ftp`, `cdn`, `static`, `dev`, `staging`, `app`.

### Custom Domains

Sellers can connect their own domain to their storefront:

- **Subdomains** (free): `slug.ma5zani.com` — automatic, uses wildcard DNS + Workers route
- **Custom domains** (premium): `mystore.com` — uses Cloudflare for SaaS custom hostnames

**Key files**:
- `convex/customDomains.ts` — Domain CRUD queries/mutations
- `app/api/custom-domains/route.ts` — Cloudflare API proxy (provision/check/delete hostnames)
- `components/dashboard/CustomDomainSection.tsx` — Dashboard UI
- `convex/schema.ts` — `customDomains` table + `customDomain` field on `storefronts`

**Flow**: Frontend calls Convex mutations directly (auth required), then calls `/api/custom-domains` for Cloudflare API operations (no auth needed — just proxies to CF).

**Env vars**: `CLOUDFLARE_ZONE_ID` (in wrangler.jsonc vars), `CLOUDFLARE_CUSTOM_HOSTNAME_API_TOKEN` (secret via `npx wrangler secret put`).

### Cloudflare Workers Patterns

**CRITICAL: Lazy ConvexHttpClient initialization** — All API routes that use `ConvexHttpClient` from `convex/browser` MUST use lazy `require()` initialization. Top-level imports break the OpenNext bundler (`handler is not a function` error).

```typescript
// CORRECT — lazy init (Workers compatible)
let _convex: import('convex/browser').ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require('convex/browser');
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}
// Use: getConvex().query(...) and getConvex().mutation(...)

// WRONG — breaks OpenNext bundler
import { ConvexHttpClient } from 'convex/browser';
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

**Routes using this pattern**: `app/api/chatbot/route.ts`, `app/api/landing-pages/generate/route.ts`, `app/api/storefront/ai/route.ts`, `app/api/delivery/fees/route.ts`, `app/api/telegram/webhook/route.ts`

**No `setInterval`** — Workers don't support persistent intervals. Use inline cleanup instead (see rate limiter in chatbot route).

**No `export const maxDuration`** — Workers measure CPU time, not wall-clock. I/O wait is free.

**`aws4fetch` for R2** — Workers don't support AWS SDK v3 (`fs.readFile not implemented`). Use `aws4fetch` instead for presigned URLs and uploads.

**`node:crypto`** — Use `import crypto from 'node:crypto'` (not `'crypto'`) for Workers compatibility.

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
- `createPublicOrder` - Order creation without auth (triggers push + email notifications)

### Notification System

When a new order is created via `createPublicOrder`, two notifications are scheduled:

1. **Push notification** (Expo) — `convex/notifications.ts:sendNewOrderNotification`
   - Sends to seller's `expoPushToken` (set from mobile app via `sellers.updatePushToken`)
   - Uses Expo Push API (`exp.host/--/api/v2/push/send`)

2. **Email notification** (Resend) — `convex/notifications.ts:sendOrderEmailNotification`
   - Only sends if `seller.emailNotifications === true` (opt-in toggle in Dashboard > Settings)
   - Uses Resend API with `RESEND_API_KEY` env var in Convex
   - Sends from `orders@ma5zani.com`
   - HTML email with order details (bilingual Arabic + English)

Both are scheduled as internal actions via `ctx.scheduler.runAfter(0, ...)` so they don't block order creation.

### Telegram Bot Integration

Sellers can link their Telegram account to manage products via bot:
- `convex/telegram.ts` - Bot command handlers
- Webhook endpoint at `/api/telegram/webhook` (registered to `https://www.ma5zani.com/api/telegram/webhook`)
- Verification code flow to link seller account
- Tables: `telegramLinks` (account linking), `telegramSessions` (multi-step command state)

### Meta Pixel Integration

Storefronts support Meta Pixel for conversion tracking:
- Pixel ID configured in `/dashboard/storefront` settings
- Script injected via `StorefrontLayout.tsx`
- Events tracked: `PageView`, `InitiateCheckout`, `Purchase`
- Server-side Conversions API via `/api/meta-conversions` route

### Support Chat System

Real-time human support chat for customers:
- Chat functions in `convex/chat.ts` (public user functions + admin functions)
- Admin functions require password validation
- Anonymous users identified by `sessionId` stored in localStorage
- Admin panel at `/admin/chats` for managing conversations

### Admin Panel

Password-protected admin panel at `/admin/*`:
- Login at `/admin` with password stored in sessionStorage
- Dashboard, sellers, orders, products, and support chats management
- Admin password set as `ADMIN_PASSWORD` env var in Convex

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

### AI Landing Pages

Sellers generate AI-powered product landing pages from the dashboard (`/dashboard/landing-pages`):

**Architecture (v3 — 2-phase pipeline)**:
- Phase 1 (parallel): Vision (Gemini) + Copywriting (Claude) + Background removal (Runware)
- Phase 2 (after vision): Scene generation via Runware FLUX Canny ControlNet (3 scene images)
- Vision: Gemini 2.0 Flash via OpenRouter — extracts palette, scene prompts, template type, product mood
- Copywriter: Claude 3.5 Sonnet via OpenRouter — Darija copy with testimonial, guarantee, scarcity, micro-copy
- Background removal: Runware.ai REST API (`lib/runware.ts`) — removes product image backgrounds
- Scene generation: Runware Canny ControlNet (`lib/runware.ts`) — 3 scene images preserving product edges
- Contrast validation: `lib/landing-page-ai/contrast.ts` — WCAG AA auto-fix (light + dark themes)

**Template versions**:
- `templateVersion: 1` (or undefined) — legacy template (basic layout, 2x2 image grid)
- `templateVersion: 2` — premium template (floating product on gradient, scroll-reveal, gallery, sticky CTA)
- `templateVersion: 3` — v3 premium with AI scene images + template dispatch by `templateType`:
  - `lifestyle-hero` — full-bleed scene hero, split benefits, testimonial (beauty/fashion/food)
  - `editorial` — magazine-style oversized headline, full-width scenes, alternating sections (luxury/jewelry)
  - `product-spotlight` — dark theme (#0a0a0a), radial spotlight glow, neon accents (electronics/tech/sports)

**Key files**:
- `lib/landing-page-ai/index.ts` — 2-phase orchestrator
- `lib/landing-page-ai/vision.ts` — image analysis + palette + scenePrompts + templateType
- `lib/landing-page-ai/copywriter.ts` — Darija copywriting with testimonial/guarantee/scarcity
- `lib/landing-page-ai/contrast.ts` — WCAG contrast: `adjustForContrast()` + `adjustForDarkTheme()`
- `lib/runware.ts` — Runware REST API: `removeBackground`, `preprocessCanny`, `generateSceneWithCanny`, `generateMultipleScenes`, `generateLifestyleScene`
- `app/api/landing-pages/generate/route.ts` — generation API + R2 upload for enhanced + scene images
- `components/landing-page/LandingPageRenderer.tsx` — dispatches v1/v2/v3 templates
- `components/landing-page/templates/` — v3 templates: `LifestyleHeroTemplate`, `EditorialTemplate`, `ProductSpotlightTemplate`
- `components/landing-page/sections/` — shared sections: `TrustBar`, `TestimonialSection`, `GuaranteeStrip`, `SceneShowcase`, `MicroCopyBar`
- `components/landing-page/ImageGallery.tsx` — thumbnail gallery with swipe
- `components/landing-page/StickyOrderBar.tsx` — mobile fixed bottom CTA
- `components/landing-page/useScrollReveal.ts` — IntersectionObserver scroll animation hook

**Schema fields** (on `landingPages` table):
- `design.gradientFrom` / `design.gradientTo` — hero gradient colors
- `design.contrastValidated` — whether WCAG check passed
- `design.isDarkTheme` — true for product-spotlight template
- `enhancedImageKeys` — R2 keys for bg-removed product images
- `sceneImageKeys` — R2 keys for AI-generated scene images (3 per page)
- `templateVersion` — 1 = legacy, 2 = premium, 3 = v3 premium
- `templateType` — `lifestyle-hero` | `editorial` | `product-spotlight`
- `content.testimonial` — `{ text, author, location }` — AI-generated customer quote
- `content.guaranteeText` — return/guarantee promise in Darija
- `content.scarcityText` — stock-based urgency text
- `content.microCopy` — `{ delivery, payment, returns }` — trust-building micro-copy

**Runware ControlNet flow**: `preprocessCanny(imageUrl)` → edge map → `generateSceneWithCanny(edgeMap, prompt)` x3. Falls back to `generateLifestyleScene()` (img2img) if canny fails. Falls back to original images if all scene generation fails.

**Runware fallback**: If `RUNWARE_API_KEY` is not set, generation works normally with original images (no bg removal, no scenes).

### AI Marketing Images

Sellers generate professional marketing images from the dashboard (`/dashboard/marketing-images`):

**AI Pipeline** (4 parallel tasks):
- Vision: `analyzeProductForMarketing()` in `lib/landing-page-ai/vision.ts` — extracts palette + generates `scenePrompt` for lifestyle scene
- Copywriter: `lib/marketing-image-ai.ts` — short Darija headline + subheadline + ctaText via Claude
- Background removal: `lib/runware.ts:removeBackground()` — transparent PNG
- Lifestyle scene: `lib/runware.ts:generateLifestyleScene()` — Runware image-to-image places product in professional photography scene

**5 Templates** (in `components/marketing-image/templates/`):
- `LifestyleHero` — full-bleed scene bg, floating product, frosted glass info card
- `SplitScene` — scene on one half, clean product on other, curved divider
- `Spotlight` — dark/moody, radial spotlight, glowing price bar
- `PromoCard` — discount-focused, scene inset thumbnail, large price, CTA button, savings callout
- `MinimalLuxe` — white Apple-style, product reflection, editorial typography

**Image capture**: `html-to-image` library renders templates at full resolution (1080x1080, 1080x1920, 1200x628), captures via `toPng()`. Cross-origin R2 images proxied through `/api/image-proxy` and converted to base64 data URLs before capture.

**Key files**:
- `app/api/marketing-image/generate/route.ts` — AI generation endpoint (lazy ConvexHttpClient)
- `components/marketing-image/ImagePreview.tsx` — preview + capture component
- `components/marketing-image/templates/index.ts` — template registry, `MarketingTemplateProps` interface
- `convex/marketingImages.ts` — CRUD (getMyMarketingImages, saveMarketingImage, deleteMarketingImage)

**Formats**: square (1080x1080), story (1080x1920), facebook (1200x628). Scene images stored in R2 under `images/scenes/{sellerId}/`, enhanced under `images/enhanced/{sellerId}/`.

### Founder Offer / Activation Gate & Trial System

Access to premium features uses a **two-tier system**: trial OR activation.

**`requireActiveSeller()`** in `convex/auth.ts` checks:
```
hasAccess = seller.isActivated || (seller.trialEndsAt !== undefined && seller.trialEndsAt > Date.now())
```

**Trial flow (new sellers):**
1. New seller signs up → `upsertSeller` creates record with `isActivated: false`, `trialEndsAt: now + 14 days`
2. During trial, seller has full access to gated features
3. After trial expires, seller sees `FounderOfferGate` on premium pages
4. Returning sellers (existing record): `upsertSeller` only updates name/phone/plan — does NOT reset `trialEndsAt` or `isActivated`

**Activation flow (paid sellers):**
1. Seller pays, sends proof via WhatsApp
2. Admin activates via `/admin/sellers` → sets `isActivated: true` + `activatedAt`
3. Activated sellers have permanent access regardless of `trialEndsAt`

**What uses `requireActiveSeller` (gated behind trial/activation):**
- Storefront editing mutations (`updateStorefront`, `publishStorefront`, etc.)
- Chatbot, landing pages, marketing images, voice studio, custom domains

**What uses `requireSeller` (no trial check — always accessible):**
- `createStorefront` — so onboarding step 2 is never blocked
- Basic product/order CRUD

**Key files:** `convex/auth.ts` (requireSeller, requireActiveSeller), `convex/sellers.ts` (upsertSeller with trialEndsAt)

**Dashboard gating:** Gated pages (`/dashboard/storefront/*`, `/dashboard/chatbot/*`, `/dashboard/voice-studio`) show `FounderOfferGate` component if not activated AND trial expired. Dashboard shows orange unlock banner for non-activated sellers.

6. Pricing is hardcoded in: `lib/translations.ts` (founderOffer section), `app/onboarding/page.tsx`, `components/landing/Pricing.tsx`

### Pricing Tiers (Current)

| Plan | Arabic | English | Price |
|------|--------|---------|-------|
| Tier 1 | أساسي | Starter | 1,000 DZD/month |
| Tier 2 | متقدم | Pro | 3,900 DZD/month |
| Tier 3 | بزنس | Business | 7,900 DZD/month |

**Founder Offer**: 4,000 DZD/year for first 50 sellers — all features unlocked. Hardcoded in `lib/translations.ts` (founderOffer section), `components/landing/Pricing.tsx` (banner), and `lib/vapi.ts` (voice assistant prompt).

### Voice Assistant (Vapi)

Houssam (حسام) is the AI voice support assistant on the homepage:
- Config and system prompt in `lib/vapi.ts`
- Uses GPT-4o-mini via Vapi with inline assistant config
- `VoiceCallButton.tsx` component embedded in `SupportChat.tsx`
- System prompt contains platform description, pricing, and how-it-works — **must be updated when pricing or positioning changes**

### Voice Studio (Cartesia TTS)

Sellers can generate professional AI audio from text at `/dashboard/voice-studio`:
- **Cartesia Sonic-3** model — supports Arabic, English, French
- API routes: `app/api/voice-studio/route.ts` (TTS generation + R2 upload), `app/api/voice-studio/voices/route.ts` (voice listing proxy with 1hr cache)
- Convex CRUD: `convex/voiceClips.ts` — `listMyClips`, `saveClip`, `deleteClip`, `getTodayClipCount`
- Generated MP3s stored in R2 under `audio/` prefix
- Gated behind `sellerHasAccess()` + `FounderOfferGate` (same as chatbot/storefront)
- **Cartesia API**: `POST https://api.cartesia.ai/tts/bytes` with `Cartesia-Version: 2025-04-16`, `model_id: sonic-3`
- Speed control: `generation_config.speed` (number, 0.6–1.5)
- Output format: `{ container: "mp3", bit_rate: 128000, sample_rate: 44100 }`
- `CARTESIA_API_KEY` secret set in Cloudflare Workers + `.dev.vars`

### Storefront Templates

Templates are in `lib/templates/`. Each template defines sections, colors, and footer config:
- `shopify.ts` - Full-featured layout (hero, features, categories, grid) — the default
- `minimal.ts` - Simple product-only layout
- `themes.ts` - 6 color-themed variants that reuse shopify sections with different palettes (Elegant Dark, Ocean Breeze, Rose Gold, Forest, Sunset, Slate Pro)
- `index.ts` - Registry of all templates, `TemplateConfig` interface, `getTemplate()` helper

The storefront header (`components/storefront/StorefrontHeader.tsx`) uses `dir={isRTL ? 'rtl' : 'ltr'}` on the container for proper flex direction in Arabic. On mobile it shows SVG line icons instead of text labels.

### Slug System

- `components/ui/SlugInput.tsx` — real-time slug availability checker with debounce
- `convex/storefronts.ts:checkSlugAvailability` — validates slug format, checks reserved words, checks uniqueness
- **Excludes seller's own storefront** from the "taken" check so editing your own slug doesn't show an error
- Slugs are used for both path URLs (`www.ma5zani.com/slug`) and subdomains (`slug.ma5zani.com`)

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

**Cloudflare Workers (wrangler.jsonc vars + secrets)**:

Vars (public, in `wrangler.jsonc`):
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `NEXT_PUBLIC_CONVEX_SITE_URL` - Convex site URL (for auth)
- `CONVEX_SITE_URL` - Convex site URL (server-side)
- `NEXT_PUBLIC_R2_PUBLIC_URL` - R2 public bucket URL
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_BUCKET_NAME` - R2 bucket name

Secrets (set via `npx wrangler secret put`):
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_WEBHOOK_SECRET` - Telegram webhook verification secret
- `OPENROUTER_API_KEY` - OpenRouter API key for AI chatbot
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` - Vapi voice assistant public key
- `META_CONVERSIONS_ACCESS_TOKEN` - Meta Conversions API token
- `CARTESIA_API_KEY` - Cartesia TTS API key for Voice Studio
- `CLOUDFLARE_CUSTOM_HOSTNAME_API_TOKEN` - Cloudflare API token for custom domain provisioning
- `RUNWARE_API_KEY` - Runware.ai API key for product image background removal

**Convex (set via `npx convex env set`)**:
- `BETTER_AUTH_SECRET` - Secret for better-auth session signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `SITE_URL` - Frontend URL (`https://www.ma5zani.com` in production)
- `ADMIN_PASSWORD` - Admin panel access password
- `RESEND_API_KEY` - Resend API key for email notifications
- `OPENROUTER_API_KEY` - OpenRouter API key (also in Convex for server-side AI)

### Configuration Files

- `wrangler.jsonc` - Cloudflare Workers config (custom domains, env vars, compatibility flags)
- `open-next.config.ts` - OpenNext Cloudflare adapter config
- `.dev.vars` - Local dev secrets for Workers (gitignored)
- `.github/workflows/deploy.yml` - CI/CD auto-deploy on push to main
- `next.config.ts` - Next.js config with `unoptimized` images for Workers
