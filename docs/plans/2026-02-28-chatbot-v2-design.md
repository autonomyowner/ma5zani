# Chatbot v2 — WhatsApp + Learning + Sales Closer

**Date:** 2026-02-28
**Status:** Approved

## Summary

Upgrade ma5zani's AI chatbot with three capabilities:
1. **WhatsApp integration** — sellers scan QR to connect their WhatsApp number
2. **Auto-learning engine** — bot learns from successful conversations
3. **Sales closer AI** — objection handling, urgency, upselling, cart recovery

## Architecture

```
┌─────────────────────────────────────────────────┐
│              ma5zani Chatbot v2                  │
├─────────────┬──────────────┬────────────────────┤
│  Channels   │   AI Brain   │   Learning Engine  │
│             │              │                    │
│ • Website   │ • Sales      │ • Conversation     │
│   (existing)│   Closer     │   analyzer         │
│ • WhatsApp  │ • Objection  │ • Auto Q&A         │
│   (new)     │   handler    │   extraction       │
│             │ • Upseller   │ • Product           │
│             │ • Urgency    │   auto-index       │
│             │              │ • Customer profiles │
└──────┬──────┴──────┬───────┴─────────┬──────────┘
       │             │                 │
       ▼             ▼                 ▼
   ┌────────┐   ┌─────────┐    ┌────────────┐
   │WhatsApp│   │Convex DB│    │ Convex     │
   │Gateway │   │(unified │    │ Cron Jobs  │
   │(VPS)   │   │messages)│    │ (learning) │
   └────────┘   └─────────┘    └────────────┘
```

All channels feed into the same Convex conversation system. The AI brain, sales logic, and learning engine are channel-agnostic.

---

## 1. WhatsApp Gateway

### Technology

- **Library:** `@whiskeysockets/baileys` (MIT, forked from OpenClaw's WhatsApp module)
- **Runtime:** Standalone Node.js service on a VPS ($5/mo Hetzner/DigitalOcean)
- **Session storage:** File-based credentials on disk with backup (OpenClaw pattern)
- **Capacity:** ~50-100 concurrent sellers per $5 VPS (1 CPU, 1GB RAM). Scale to $20 VPS for 500+.

### Seller Flow

1. Seller navigates to `/dashboard/chatbot/whatsapp`
2. Clicks "Connect WhatsApp" → gateway generates QR code
3. Seller scans QR with their phone (WhatsApp → Linked Devices)
4. Connection established — dashboard shows "Connected" with green dot
5. Session persists on disk — no re-scan needed unless seller logs out

### Message Flow

```
Customer sends WhatsApp message to seller's number
  → Baileys WebSocket receives it
  → Gateway calls Convex HTTP API: POST /api/whatsapp/incoming
     { sellerId, from, text, mediaUrl }
  → Convex saves to chatbotMessages (channel: "whatsapp")
  → Convex triggers /api/chatbot (same AI brain as website)
  → AI response returned
  → Gateway sends reply via Baileys
  → Customer receives reply on WhatsApp
```

### Gateway API Endpoints

```
GET  /api/sellers/:id/qr        → Generate QR code (returns data:image/png;base64)
GET  /api/sellers/:id/status    → Connection status (connected/disconnected/qr_pending)
POST /api/sellers/:id/disconnect → Disconnect WhatsApp session
POST /api/webhook/incoming      → Convex calls this for outbound messages
```

### Components Forked from OpenClaw

| OpenClaw File | Purpose | What We Modify |
|---|---|---|
| `src/web/session.ts` | Baileys socket + credential save | Multi-tenant (per seller) |
| `src/web/login-qr.ts` | QR generation, 3-min timeout | REST API instead of CLI |
| `src/web/auth-store.ts` | File persistence + backup | Seller-scoped directories |
| `src/web/outbound.ts` | Message sending | Bridge to Convex |
| `src/web/inbound/monitor.ts` | Message receiving + dedup | Route to Convex API |

### Schema Additions

```typescript
// New table
whatsappSessions: defineTable({
  sellerId: v.id("sellers"),
  phoneNumber: v.optional(v.string()),
  status: v.union(v.literal("connected"), v.literal("disconnected"), v.literal("qr_pending")),
  connectedAt: v.optional(v.number()),
  lastSeenAt: v.optional(v.number()),
}).index("sellerId", ["sellerId"]),

// Add to chatbotConversations
channel: v.optional(v.union(v.literal("web"), v.literal("whatsapp"))),
whatsappJid: v.optional(v.string()),

// Add to chatbotMessages
channel: v.optional(v.union(v.literal("web"), v.literal("whatsapp"))),
```

### Dashboard UI

**New page:** `/dashboard/chatbot/whatsapp`
- QR code display with countdown timer (3 min)
- Connection status indicator (green dot = connected)
- Phone number display when connected
- "Disconnect" button
- Message stats (today's messages, response rate)

---

## 2. Auto-Learning Engine

### 2a. Conversation Analyzer

**Convex cron job — runs every 6 hours.**

Scans conversations that ended with a confirmed order:
- Extracts Q&A patterns that led to the sale
- Identifies objections and how they were resolved
- Generates knowledge entries marked as `source: "auto-learned"`
- Seller sees "Suggested Knowledge" in dashboard with approve/edit/dismiss

**Algorithm:**
1. Query `chatbotConversations` where `context.orderState === "completed"` and `analyzedAt` is null
2. For each conversation, fetch all messages
3. Use AI (Claude Haiku via OpenRouter) to extract:
   - Customer questions → Bot/seller answers that worked
   - Objection patterns → Resolution strategies
   - Product-specific insights
4. Save as `chatbotLearnedKnowledge` with `status: "pending"`
5. Mark conversation as `analyzedAt: Date.now()`

### 2b. Product Auto-Indexing

When seller adds/updates a product:
- AI generates rich description from product name + images + price
- Description becomes part of bot context for natural conversation
- Example: photo of red dress → "فستان أحمر أنيق مناسب للسهرات"

### 2c. Customer Memory

Bot remembers returning customers by phone (WhatsApp) or session (web):
- Previous orders, preferred wilaya, name, product interests
- Enables: "Welcome back Amira! Your last order was delivered to Oran."
- One-click reorder for returning customers

### Schema Additions

```typescript
// New table
chatbotLearnedKnowledge: defineTable({
  chatbotId: v.id("chatbots"),
  question: v.string(),
  answer: v.string(),
  keywords: v.array(v.string()),
  category: v.string(),
  source: v.union(v.literal("auto-learned"), v.literal("seller-approved")),
  sourceConversationId: v.optional(v.id("chatbotConversations")),
  confidence: v.number(),  // 0-1
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("dismissed")),
})
  .index("chatbotId", ["chatbotId"])
  .index("status", ["chatbotId", "status"]),

// New table
chatbotCustomerProfiles: defineTable({
  chatbotId: v.id("chatbots"),
  identifier: v.string(),  // phone number or sessionId
  channel: v.string(),
  name: v.optional(v.string()),
  wilaya: v.optional(v.string()),
  orderHistory: v.array(v.object({
    orderId: v.id("orders"),
    productName: v.string(),
    date: v.number(),
  })),
  interests: v.array(v.string()),
  lastInteraction: v.number(),
})
  .index("chatbotId", ["chatbotId"])
  .index("lookup", ["chatbotId", "identifier"]),

// Add to chatbotConversations
analyzedAt: v.optional(v.number()),
```

### Dashboard UI

**New tab in `/dashboard/chatbot`:** "Learning"
- Pending auto-learned knowledge: approve/edit/dismiss buttons
- Stats: "Bot learned 12 new Q&As this week from 8 successful sales"
- Customer profiles list: "23 returning customers recognized"
- Confidence scores on learned knowledge

---

## 3. Sales Closer AI

### Six Closing Capabilities

**1. Objection Handling**
- "غالي" (expensive) → value framing: daily cost breakdown, alternatives
- "مش متأكد" (not sure) → social proof + guarantee info
- "لازم نشوف" (need to think) → save cart, offer to follow up

**2. Urgency Creation (honest, data-driven)**
- Real stock levels: "باقي 3 قطع فقط" (only 3 left) — from actual inventory
- Recent sales: "تم بيع 5 قطع اليوم" (5 sold today) — from real order data
- Sale end dates if seller sets them

**3. Upselling & Cross-selling**
- After cart add: "العملاء اللي شراو هذا حبوا أيضا..." (customers who bought this also liked...)
- Bundle free delivery: "لو تزيد [product], توصلك التوصيلة مجانية"
- Size/color upgrades

**4. Abandoned Cart Recovery**
- WhatsApp: follow-up after 30min silence: "هل مازلت مهتم بـ [product]؟"
- Web: reminder on revisit
- Optional small discount (seller-configurable)

**5. Social Proof**
- "هذا المنتج الأكثر مبيعا هذا الشهر" (best-seller this month) — real data
- Customer count: "أكثر من 50 عميل راضي" (50+ satisfied customers)

**6. Checkout Push**
- After 2-3 exchanges without order: "تحب نبدالك الطلب؟" (want me to start your order?)
- Returning customers: "نفس الطلبية السابقة؟" (same as last order?)

### Implementation

**Enhanced system prompt in `lib/ai.ts`:**

```
You are a sales-focused chatbot for an Algerian online store.
Your goal: help customers AND close sales.

CLOSING RULES:
- After 2+ exchanges without order intent → suggest a product
- If customer shows interest → immediately offer to start order
- If objection about price → break down daily cost, suggest alternatives
- If objection about quality → mention satisfied customers, return policy
- Always mention real stock levels when low (<10 units)
- For returning customers → reference past purchases, offer reorder
- Never lie about stock, reviews, or features
- Use Algerian Darija naturally
```

**New AI response field:**

```json
{
  "orderAction": "none",
  "salesAction": "upsell|urgency|objection|followup|social_proof|none",
  "salesData": {
    "relatedProductId": "...",
    "stockLevel": 3,
    "recentSalesCount": 5
  }
}
```

**`salesAction` handling in API route:**
- `upsell` → fetch related products, include in next context
- `urgency` → check real stock levels, inject into response
- `followup` → schedule WhatsApp follow-up message (30min delay)
- `social_proof` → query recent order count for the product

### Seller Controls (Dashboard)

New settings in `/dashboard/chatbot`:
- **Sales intensity:** Gentle / Balanced / Aggressive (controls prompt tone)
- **Auto follow-up:** Enable/disable abandoned cart messages
- **Discount authority:** Allow bot to offer up to X% discount (0 = disabled)
- **Upsell products:** Manually link related products (or auto from categories)

---

## 4. Files to Create/Modify

### New Files

| File | Purpose |
|---|---|
| `whatsapp-gateway/` | Standalone Node.js service (separate repo or directory) |
| `whatsapp-gateway/src/index.ts` | Express server + multi-tenant Baileys manager |
| `whatsapp-gateway/src/session-manager.ts` | Per-seller socket management |
| `whatsapp-gateway/src/convex-bridge.ts` | Forward messages to/from Convex |
| `whatsapp-gateway/src/qr-handler.ts` | QR generation API |
| `app/dashboard/chatbot/whatsapp/page.tsx` | WhatsApp connection UI |
| `app/dashboard/chatbot/learning/page.tsx` | Learning dashboard tab |
| `app/api/whatsapp/incoming/route.ts` | Receive messages from gateway |
| `app/api/whatsapp/outgoing/route.ts` | Send messages to gateway |
| `convex/whatsappSessions.ts` | WhatsApp session CRUD |
| `convex/chatbotLearning.ts` | Learning engine functions + cron |
| `convex/chatbotCustomerProfiles.ts` | Customer profile CRUD |

### Modified Files

| File | Changes |
|---|---|
| `convex/schema.ts` | Add whatsappSessions, chatbotLearnedKnowledge, chatbotCustomerProfiles tables; add channel fields |
| `convex/chatbot.ts` | Add channel awareness to conversation functions |
| `lib/ai.ts` | Enhanced system prompt with sales closer + customer memory context |
| `app/api/chatbot/route.ts` | Handle salesAction, customer profile lookup, follow-up scheduling |
| `app/dashboard/chatbot/page.tsx` | Add WhatsApp status card + learning stats |
| `components/storefront/ChatbotWidget.tsx` | Minor: add channel tracking |

---

## 5. Implementation Order

**Phase 1 — Sales Closer (1-2 days)**
- Enhance `lib/ai.ts` system prompt with closing rules
- Add `salesAction` to response JSON parsing
- Add real stock/sales data to AI context
- Add seller sales settings to dashboard

**Phase 2 — Learning Engine (2-3 days)**
- Create schema tables
- Build conversation analyzer (Convex action)
- Set up cron job (every 6 hours)
- Build customer profile system
- Add learning dashboard tab

**Phase 3 — WhatsApp Gateway (3-5 days)**
- Fork OpenClaw WhatsApp module
- Build multi-tenant session manager
- Create REST API
- Build Convex bridge
- Add dashboard WhatsApp page
- Deploy to VPS
- Test end-to-end

**Phase 4 — Cart Recovery (1 day)**
- Scheduled follow-up messages via WhatsApp
- Web revisit detection
- Seller configuration for follow-up timing/discount

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WhatsApp bans seller accounts | Warn sellers, rate-limit messages (max 50/hr), no bulk messaging |
| VPS downtime | Health monitoring, auto-restart, Convex stores messages for retry |
| AI generates inappropriate sales tactics | Seller reviews learned knowledge, intensity settings, never lie rule |
| Learning engine produces bad knowledge | All auto-learned entries require seller approval before going live |
| Customer privacy (profiles) | Phone numbers hashed, data auto-deleted after 90 days of inactivity |
