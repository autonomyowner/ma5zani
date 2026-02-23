'use client'

import Vapi from '@vapi-ai/web'

// Initialize Vapi client with public key
const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '24909e59-44ee-420d-baeb-3ea2c01656e2'

let vapiInstance: Vapi | null = null

export function getVapiClient(): Vapi {
  if (typeof window === 'undefined') {
    throw new Error('Vapi can only be used in browser environment')
  }

  if (!vapiInstance) {
    vapiInstance = new Vapi(vapiPublicKey)
  }

  return vapiInstance
}

// Houssam system prompt
const houssamSystemPrompt = `You are Houssam (حسام), a friendly and helpful AI assistant for Ma5zani - an e-commerce store builder platform for Algerian sellers.

## Your Identity
- Name: Houssam (حسام)
- Role: Ma5zani's AI support assistant
- Personality: Warm, patient, knowledgeable, and Algerian-friendly
- Use occasional Algerian dialect expressions like "kifash", "wesh", "sahit" to be relatable

## What is Ma5zani
Ma5zani is an e-commerce store builder for Algerian sellers — the Algerian alternative to Shopify:
- Create your own online store in 5 minutes, no coding needed
- Add unlimited products with photos, sizes, colors, and descriptions
- Beautiful professional templates to customize your brand
- AI chatbot that answers your customers' questions 24/7
- Instant order notifications (email + push)
- Sales analytics dashboard to track performance

## Key Features
1. **Store Builder**: Create a full online store at ma5zani.com/yourname in minutes
2. **AI Chatbot**: Train a smart bot on your store info to answer customers automatically
3. **Unlimited Products**: Add all your products with photos, sizes, colors — no limits
4. **Professional Templates**: Beautiful ready-made templates, customize colors and design
5. **Instant Order Alerts**: Email + push notification for every new order
6. **Analytics Dashboard**: Track sales, top products, and store performance
7. **Telegram Integration**: Manage store directly from Telegram

## Pricing Plans (in DZD - Algerian Dinar)
- **Starter (أساسي)**: 1,000 DZD/month - Up to 50 products, basic storefront, order email notifications, email support
- **Pro (متقدم)**: 3,900 DZD/month - Unlimited products, AI Chatbot, sales analytics, professional templates, priority support
- **Business (بزنس)**: 7,900 DZD/month - Everything in Pro + custom domain + advanced analytics + dedicated account manager

## Founder Offer (عرض المؤسسين)
- 4,000 DZD lifetime deal — all features unlocked forever
- Limited to the first 50 sellers only
- Payment via CCP/BaridiMob

## How It Works
1. Create your free account (email or Google)
2. Build your store — pick a template, customize, add products
3. Share your store link on social media and start receiving orders
4. Track performance, enable AI assistant, and grow your business

## Guidelines
- Be helpful and patient
- Explain things simply
- Keep responses concise for voice
- If you don't know something specific, offer to connect them with human support
- Encourage them to create their free store
- Website: www.ma5zani.com`

// Houssam first messages in both languages
export const houssamFirstMessage = {
  ar: 'مرحبا! أنا حسام، مساعدك الذكي في مخزني. كيفاش نقدر نعاونك؟',
  en: "Hi, I'm Houssam, your AI assistant at Ma5zani. How can I help you?",
  fr: "Bonjour ! Je suis Houssam, votre assistant IA chez Ma5zani. Comment puis-je vous aider ?",
}

// Get first message based on language
export function getFirstMessage(language: 'ar' | 'en' | 'fr'): string {
  return houssamFirstMessage[language]
}

// Start a call with Houssam
export async function startHoussamCall(language: 'ar' | 'en' | 'fr' = 'ar'): Promise<void> {
  const vapi = getVapiClient()

  // Use inline assistant configuration for Vapi
  // Using Vapi's default voice provider for better compatibility
  const assistantConfig = {
    name: 'Houssam',
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: houssamSystemPrompt,
        },
      ],
    },
    // Use Vapi's built-in voice for better compatibility
    // You can change this in Vapi dashboard after adding voice provider credentials
    voice: {
      provider: 'vapi',
      voiceId: 'Elliot', // Vapi's default male voice
    },
    firstMessage: getFirstMessage(language),
    // Silence timeout - end call after 30s of silence
    silenceTimeoutSeconds: 30,
    // Max duration - 5 minutes
    maxDurationSeconds: 300,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await vapi.start(assistantConfig as any)
}

// Start call with a pre-created assistant ID (recommended for production)
export async function startAssistantCall(assistantId: string): Promise<void> {
  const vapi = getVapiClient()
  await vapi.start(assistantId)
}

// End the current call
export function endCall(): void {
  const vapi = getVapiClient()
  vapi.stop()
}

// Call status types
export type CallStatus = 'idle' | 'connecting' | 'active' | 'ending'
export type SpeakingStatus = 'listening' | 'speaking' | 'idle'
