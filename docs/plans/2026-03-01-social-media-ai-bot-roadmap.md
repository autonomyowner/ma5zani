# ma5zani Social Media AI Bot — Roadmap & Goals

**Date**: 2026-03-01
**Status**: In Progress

---

## What We Built (Feb 28, 2026)

### WhatsApp Integration — LIVE
- Standalone gateway on Hetzner VPS (46.225.131.173) at `wa.ma5zani.com`
- Uses `@whiskeysockets/baileys` (MIT) for unofficial WhatsApp Web API
- Multi-tenant: one Baileys socket per seller, file-based credential persistence
- QR code pairing from seller dashboard (`/dashboard/chatbot/whatsapp`)
- Auto-reply: incoming messages → AI chatbot → response sent back via WhatsApp
- Session restore on restart (credentials persisted to disk)
- PM2 managed, Nginx reverse proxy, Let's Encrypt SSL

### Sales Closer AI — LIVE
- 3 intensity levels: gentle / balanced / aggressive
- Objection handling, urgency creation, upselling, cross-selling
- Cart recovery and social proof injection
- Configurable max discount percentage
- Bilingual prompts (Arabic + English)

### Auto-Learning Engine — LIVE
- Extracts Q&A patterns from successful order conversations
- Pending → approved/dismissed review flow in dashboard
- Returning customer recognition by phone/session
- Knowledge auto-merges into chatbot context

---

## Architecture

```
Customer (WhatsApp/Web) → Gateway/Widget → /api/whatsapp/incoming or /api/chatbot
                                                    ↓
                                            Convex (context, products, knowledge)
                                                    ↓
                                            OpenRouter (Claude 3.5 Haiku)
                                                    ↓
                                            AI Response + Sales Logic
                                                    ↓
                                            Reply via WhatsApp / Web Widget
```

**VPS**: Hetzner cx23 (2 vCPU, 4GB RAM) — handles ~50-100 sellers
**Gateway Stack**: Node.js + Express + Baileys + PM2

---

## The Vision: Omnichannel AI Sales Bot

Every Algerian seller on ma5zani gets a single AI bot that:
- Replies to customers across ALL channels (WhatsApp, Instagram, Facebook, web)
- Learns from every conversation and gets smarter over time
- Closes deals — handles objections, offers discounts, creates urgency
- Knows the full product catalog, stock levels, pricing
- Speaks Darija, Arabic, French, and English naturally
- Hands off to human seller when needed

---

## Roadmap

### Phase 1: Harden WhatsApp (March 2026)

**Goal**: Make WhatsApp integration production-solid for 50+ sellers

- [ ] Auto-reconnect with exponential backoff on disconnect
- [ ] Health check endpoint + PM2 monitoring alerts
- [ ] Rate limiting per seller (avoid WhatsApp bans)
- [ ] Message queuing (Redis/BullMQ) for reliability — don't lose messages
- [ ] Media support: receive images, voice notes → extract text/context
- [ ] Group chat handling (ignore or opt-in)
- [ ] Typing indicator before AI response
- [ ] Read receipts
- [ ] Deploy script: `npm run deploy:gateway` (auto scp + restart)
- [ ] Dashboard: message history, analytics, response time metrics
- [ ] Multi-VPS strategy for scaling beyond 100 sellers

### Phase 2: Instagram DMs (April 2026)

**Goal**: Add Instagram as a channel — same bot, same knowledge

- [ ] Meta Graph API integration (official, no ban risk)
- [ ] Instagram Business account linking via OAuth
- [ ] Webhook receiver for incoming DMs
- [ ] Unified conversation thread (cross-channel customer identity)
- [ ] Image/story reply support
- [ ] Dashboard: Instagram connection settings
- [ ] Same AI pipeline: context → OpenRouter → response

**Key Difference from WhatsApp**: Official API, requires Meta App Review, needs Facebook Page connected to IG Business account.

### Phase 3: Facebook Messenger (May 2026)

**Goal**: Add Facebook Messenger — shares Meta Graph API infra with Instagram

- [ ] Facebook Page linking via OAuth
- [ ] Messenger webhook for incoming messages
- [ ] Persistent menu + get started button
- [ ] Quick replies for product selection
- [ ] Carousel messages for product showcase
- [ ] Shared customer profile across FB + IG + WhatsApp

### Phase 4: Unified Inbox & Analytics (June 2026)

**Goal**: Single dashboard for all channels

- [ ] Unified inbox: all conversations from all channels in one view
- [ ] Channel badge (WhatsApp/IG/FB/Web) on each conversation
- [ ] Cross-channel customer merging (same phone = same customer)
- [ ] Response time analytics per channel
- [ ] Conversion tracking: conversation → order
- [ ] Bot performance: auto-resolved vs handoff rate
- [ ] Revenue attribution: which channel drives most sales
- [ ] Export conversations as CSV

### Phase 5: Advanced Bot Intelligence (July 2026)

**Goal**: Make the bot genuinely smart

- [ ] Product image recognition: customer sends photo → bot identifies product
- [ ] Voice note transcription (Whisper API) → text → AI response
- [ ] Proactive follow-up: "You asked about X yesterday, still interested?"
- [ ] Abandoned cart recovery via WhatsApp/IG DM
- [ ] Order status updates pushed to customer's preferred channel
- [ ] Seasonal/promotional awareness (Ramadan, Black Friday)
- [ ] A/B testing different sales approaches per seller
- [ ] Fine-tuned model per seller based on their successful conversations

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| WhatsApp API | Baileys (unofficial) | Free, no Meta approval needed, fast to ship |
| IG/FB API | Meta Graph API (official) | Required for business accounts, no ban risk |
| AI Model | Claude 3.5 Haiku via OpenRouter | Fast, cheap, multilingual, good at sales |
| Gateway hosting | Hetzner VPS | Cheap ($5/mo), persistent connections needed |
| Session persistence | File-based (Baileys) | Simple, no extra DB needed |
| Message queue | Redis/BullMQ (Phase 1) | Reliability, retry, no lost messages |
| Customer identity | Phone number + cross-channel merge | Natural identifier in Algeria |

---

## Success Metrics

- **Response time**: < 5 seconds average
- **Auto-resolution rate**: > 70% of conversations handled without human
- **Conversion rate**: > 15% of bot conversations lead to orders
- **Seller adoption**: > 50% of active sellers connect at least 1 channel
- **Customer satisfaction**: < 5% "talk to human" requests
- **Uptime**: 99.5%+ gateway availability

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| WhatsApp Gateway | LIVE | 2 sellers connected, VPS running |
| Sales Closer AI | LIVE | 3 intensity levels working |
| Learning Engine | LIVE | Dashboard at /dashboard/chatbot/learning |
| Instagram DMs | PLANNED | Phase 2 — April 2026 |
| Facebook Messenger | PLANNED | Phase 3 — May 2026 |
| Unified Inbox | PLANNED | Phase 4 — June 2026 |
