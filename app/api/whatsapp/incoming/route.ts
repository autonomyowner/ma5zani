import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateAIResponse, detectLanguage } from '@/lib/ai';

// Lazy ConvexHttpClient (Workers pattern)
let _convex: import('convex/browser').ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require('convex/browser');
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

export async function POST(request: NextRequest) {
  try {
    const { sellerId, from, text } = await request.json();

    if (!sellerId || !from || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Find seller's chatbot and storefront
    const chatbotInfo = await getConvex().query(
      api.chatbot.getPublicChatbotBySeller,
      {
        sellerId: sellerId as Id<'sellers'>,
      }
    );

    if (!chatbotInfo) {
      return NextResponse.json(
        { error: 'No chatbot found' },
        { status: 404 }
      );
    }

    // Get or create conversation for this WhatsApp number
    // Use the WhatsApp JID as the session ID
    const sessionId = `wa_${from}`;

    const conversationId = await getConvex().mutation(
      api.chatbot.getOrCreateConversation,
      {
        storefrontSlug: chatbotInfo.storefrontSlug,
        sessionId,
      }
    );

    // Save customer message
    await getConvex().mutation(api.chatbot.customerSendMessage, {
      conversationId,
      content: text,
      sessionId,
    });

    // Get AI context
    const context = await getConvex().query(api.chatbot.getAIContext, {
      conversationId,
      sessionId,
    });

    if (!context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    // Skip AI if in handoff mode
    if (context.conversationStatus === 'handoff') {
      return NextResponse.json({ response: null, handoff: true });
    }

    // Get messages for conversation history
    const messages = await getConvex().query(api.chatbot.getPublicMessages, {
      conversationId,
      sessionId,
    });

    const language = await detectLanguage(text);

    const conversationHistory = (messages || []).map(
      (msg: { sender: string; content: string }) => ({
        sender: msg.sender,
        content: msg.content,
      })
    );

    // Generate AI response
    const aiResponse = await generateAIResponse(
      {
        chatbot: context.chatbot,
        storefront: context.storefront,
        seller: context.seller || undefined,
        knowledge: context.knowledge,
        products: context.products.map((p) => ({
          ...p,
          id: String(p.id),
          sizes: p.sizes || undefined,
          colors: p.colors || undefined,
        })),
        currentProduct: context.currentProduct
          ? {
              ...context.currentProduct,
              id: String(context.currentProduct.id),
            }
          : undefined,
        context: context.context
          ? {
              ...context.context,
              currentProductId: context.context.currentProductId
                ? String(context.context.currentProductId)
                : undefined,
            }
          : undefined,
      },
      conversationHistory,
      text,
      language
    );

    // Clean JSON action from response
    const jsonRegex = /```json\s*\n?([\s\S]*?)\n?\s*```/;
    const cleanResponse = aiResponse.replace(jsonRegex, '').trim();

    // Save bot response
    await getConvex().mutation(api.chatbot.addBotResponse, {
      conversationId,
      content: cleanResponse,
    });

    return NextResponse.json({ response: cleanResponse });
  } catch (error) {
    console.error('WhatsApp incoming error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
