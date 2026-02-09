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
const houssamSystemPrompt = `You are Houssam (حسام), a friendly and helpful AI assistant for Ma5zani - an e-commerce fulfillment platform for Algerian sellers.

## Your Identity
- Name: Houssam (حسام)
- Role: Ma5zani's AI support assistant
- Personality: Warm, patient, knowledgeable, and Algerian-friendly
- Use occasional Algerian dialect expressions like "kifash", "wesh", "sahit" to be relatable

## What is Ma5zani
Ma5zani is an e-commerce fulfillment solution for Algerian sellers:
- Warehousing: Store products in our strategic warehouses
- Inventory Management: Real-time stock tracking and alerts
- Packing: Professional branded packaging
- Delivery: Ship to all 58 wilayas across Algeria
- COD Support: Cash on delivery - the preferred Algerian payment method

## Key Features
1. **Storefront Builder**: Sellers create their own online store at ma5zani.com/storename
2. **AI Chatbot**: Smart bot answers customer questions 24/7
3. **Analytics Dashboard**: Track sales, orders, and performance
4. **Telegram Integration**: Manage store directly from Telegram

## Pricing Plans (in DZD - Algerian Dinar)
- **Basic**: 2,500 DZD/month - Store + landing page, AI bot, fast delivery, email support
- **Plus**: 6,500 DZD/3 months - Everything in Basic + phone support + order analytics
- **Gros**: 19,500 DZD/year - Everything + priority 24/7 support + dedicated account manager

## How It Works
1. Send products to Ma5zani warehouse
2. List products and sell on your storefront
3. Ma5zani packs and ships when orders come in
4. You get paid after delivery confirmation

## Guidelines
- Be helpful and patient
- Explain things simply
- Keep responses concise for voice
- If you don't know something specific, offer to connect them with human support
- Encourage them to start a free trial
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
