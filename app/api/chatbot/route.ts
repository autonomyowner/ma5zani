import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateAIResponse, detectLanguage } from '@/lib/ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15; // max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { conversationId, sessionId, message } = body;

    if (!conversationId || !sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get AI context from Convex
    const context = await convex.query(api.chatbot.getAIContext, {
      conversationId: conversationId as Id<'chatbotConversations'>,
      sessionId,
    });

    if (!context) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if conversation is in handoff mode (seller is handling)
    if (context.conversationStatus === 'handoff') {
      // Don't generate AI response when seller is handling
      return NextResponse.json({ response: null, handoff: true });
    }

    // Get conversation messages for context
    const messages = await convex.query(api.chatbot.getPublicMessages, {
      conversationId: conversationId as Id<'chatbotConversations'>,
      sessionId,
    });

    // Detect language from customer message
    const language = await detectLanguage(message);

    // Format messages for AI
    const conversationHistory = (messages || []).map((msg: { sender: string; content: string }) => ({
      sender: msg.sender,
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateAIResponse(
      {
        chatbot: context.chatbot,
        storefront: context.storefront,
        seller: context.seller || undefined,
        knowledge: context.knowledge,
        products: context.products.map(p => ({ ...p, id: String(p.id) })),
        currentProduct: context.currentProduct
          ? { ...context.currentProduct, id: String(context.currentProduct.id) }
          : undefined,
        context: context.context || undefined,
      },
      conversationHistory,
      message,
      language
    );

    // Save bot response to Convex
    await convex.mutation(api.chatbot.addBotResponse, {
      conversationId: conversationId as Id<'chatbotConversations'>,
      content: aiResponse,
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
