import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateAIResponse, detectLanguage } from '@/lib/ai';
import { getDeliveryFees } from '@/lib/yalidine';
import { toYalidineId } from '@/lib/yalidine-wilaya-map';

let _convex: import('convex/browser').ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require('convex/browser');
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15; // max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Clean up expired entries inline (Workers don't support setInterval)
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Extract JSON action block from AI response
function extractOrderAction(aiResponse: string): {
  cleanResponse: string;
  action: { orderAction: string; salesAction?: string; data: Record<string, unknown> } | null;
} {
  const jsonRegex = /```json\s*\n?([\s\S]*?)\n?\s*```/;
  const match = aiResponse.match(jsonRegex);

  if (!match) {
    return { cleanResponse: aiResponse, action: null };
  }

  const cleanResponse = aiResponse.replace(jsonRegex, '').trim();

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed && typeof parsed.orderAction === 'string') {
      return { cleanResponse, action: parsed };
    }
  } catch {
    // Invalid JSON — treat as normal message
  }

  return { cleanResponse, action: null };
}

// Process order action and return context updates + metadata
async function processOrderAction(
  action: { orderAction: string; data: Record<string, unknown> },
  currentContext: Record<string, unknown> | undefined,
  products: Array<{ id: string; name: string; price: number; salePrice?: number; stock: number; sizes?: string[]; colors?: string[] }>,
  storefrontSlug: string,
  conversationId: Id<'chatbotConversations'>,
  sessionId: string,
): Promise<{
  contextUpdates: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}> {
  const ctx = currentContext || {};
  const orderItems = (ctx.orderItems as Array<{ productId: string; productName: string; quantity: number; unitPrice: number; selectedSize?: string; selectedColor?: string }>) || [];

  switch (action.orderAction) {
    case 'none':
      return { contextUpdates: null, metadata: null };

    case 'start':
      return {
        contextUpdates: { orderState: 'selecting', orderItems: [] },
        metadata: null,
      };

    case 'add_item': {
      const data = action.data;
      const productId = data.productId as string;
      const product = products.find(p => String(p.id) === productId);

      if (!product || product.stock <= 0) {
        return { contextUpdates: null, metadata: null };
      }

      const newItem = {
        productId: String(product.id),
        productName: product.name,
        quantity: (data.quantity as number) || 1,
        unitPrice: product.salePrice || product.price,
        selectedSize: data.selectedSize as string | undefined,
        selectedColor: data.selectedColor as string | undefined,
      };

      // Replace item if same product already in list, otherwise add
      const existingIdx = orderItems.findIndex(i => i.productId === newItem.productId);
      const updatedItems = [...orderItems];
      if (existingIdx >= 0) {
        updatedItems[existingIdx] = newItem;
      } else {
        updatedItems.push(newItem);
      }

      return {
        contextUpdates: { orderState: 'collecting_info', orderItems: updatedItems },
        metadata: null,
      };
    }

    case 'set_info': {
      const data = action.data;
      const updates: Record<string, unknown> = {};

      if (data.customerName) updates.customerName = data.customerName;
      if (data.customerPhone) updates.customerPhone = data.customerPhone;
      if (data.wilaya) {
        updates.wilaya = data.wilaya;

        // Try to fetch delivery fee
        try {
          const creds = await getConvex().query(api.delivery.getDeliveryCredentialsBySlug, { slug: storefrontSlug });
          if (creds) {
            const fromWilayaId = parseInt(creds.originWilayaCode, 10);
            const toWilayaId = toYalidineId(data.wilaya as string);
            if (toWilayaId) {
              const fees = await getDeliveryFees(
                { apiId: creds.apiId, apiToken: creds.apiToken },
                fromWilayaId,
                toWilayaId
              );
              // Default to home delivery fee
              updates.deliveryFee = fees.home_fee;
            }
          }
        } catch (err) {
          console.error('Failed to fetch delivery fee:', err);
          // Continue without fee
        }
      }
      if (data.deliveryAddress) updates.deliveryAddress = data.deliveryAddress;

      // Also update customer info on the conversation record
      if (data.customerName || data.customerPhone) {
        try {
          await getConvex().mutation(api.chatbot.updateCustomerInfo, {
            conversationId,
            sessionId,
            customerName: data.customerName as string | undefined,
            customerPhone: data.customerPhone as string | undefined,
          });
        } catch (err) {
          console.error('Failed to update customer info:', err);
        }
      }

      return {
        contextUpdates: { ...updates, orderState: 'collecting_info' },
        metadata: null,
      };
    }

    case 'request_confirm': {
      const items = (ctx.orderItems as typeof orderItems) || orderItems;
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const deliveryFee = (ctx.deliveryFee as number) || 0;
      const total = subtotal + deliveryFee;

      return {
        contextUpdates: { orderState: 'confirming' },
        metadata: {
          type: 'order_summary',
          orderData: {
            items: items.map(i => ({
              productName: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              selectedSize: i.selectedSize,
              selectedColor: i.selectedColor,
            })),
            subtotal,
            deliveryFee,
            total,
            customerName: ctx.customerName as string || '',
            wilaya: ctx.wilaya as string || '',
          },
        },
      };
    }

    case 'confirm': {
      const items = (ctx.orderItems as typeof orderItems) || [];
      if (items.length === 0) return { contextUpdates: null, metadata: null };

      // Already completed — prevent duplicate
      if (ctx.orderState === 'completed') return { contextUpdates: null, metadata: null };

      try {
        const result = await getConvex().mutation(api.publicOrders.createPublicOrder, {
          storefrontSlug,
          items: items.map(i => ({
            productId: i.productId as Id<'products'>,
            quantity: i.quantity,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor,
          })),
          customerName: (ctx.customerName as string) || '',
          customerPhone: (ctx.customerPhone as string) || '',
          wilaya: (ctx.wilaya as string) || '',
          deliveryAddress: (ctx.deliveryAddress as string) || '',
          deliveryFee: (ctx.deliveryFee as number) || undefined,
        });

        const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const deliveryFee = (ctx.deliveryFee as number) || 0;
        const total = subtotal + deliveryFee;

        return {
          contextUpdates: {
            orderState: 'completed',
            placedOrderIds: result.orderIds.map(String),
            placedOrderNumber: result.orderNumber,
          },
          metadata: {
            type: 'order_confirmed',
            orderData: {
              items: items.map(i => ({
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                selectedSize: i.selectedSize,
                selectedColor: i.selectedColor,
              })),
              subtotal,
              deliveryFee,
              total,
              customerName: ctx.customerName as string || '',
              wilaya: ctx.wilaya as string || '',
              orderNumber: result.orderNumber,
              orderId: result.orderIds[0] ? String(result.orderIds[0]) : undefined,
            },
          },
        };
      } catch (err) {
        console.error('Failed to create order:', err);
        return { contextUpdates: null, metadata: null };
      }
    }

    case 'cancel':
      return {
        contextUpdates: {
          orderState: 'idle',
          orderItems: undefined,
          customerName: undefined,
          customerPhone: undefined,
          deliveryAddress: undefined,
          deliveryFee: undefined,
          commune: undefined,
        },
        metadata: null,
      };

    default:
      return { contextUpdates: null, metadata: null };
  }
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
    const context = await getConvex().query(api.chatbot.getAIContext, {
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
    const messages = await getConvex().query(api.chatbot.getPublicMessages, {
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

    // Compute recent order count for social proof (based on low-stock products)
    const productsWithStock = context.products.filter(p => p.stock > 0);
    // Estimate recent orders: count products with stock < 20 as "selling well"
    const recentOrderCount = productsWithStock.filter(p => p.stock < 20).length;

    // Build sales settings for AI context
    const salesSettings = (context as unknown as { salesSettings?: { intensity: 'gentle' | 'balanced' | 'aggressive'; autoFollowUp: boolean; maxDiscountPercent?: number } }).salesSettings;

    // Generate AI response
    const aiResponse = await generateAIResponse(
      {
        chatbot: context.chatbot,
        storefront: context.storefront,
        seller: context.seller || undefined,
        knowledge: context.knowledge,
        products: context.products.map(p => ({
          ...p,
          id: String(p.id),
          sizes: p.sizes || undefined,
          colors: p.colors || undefined,
        })),
        currentProduct: context.currentProduct
          ? { ...context.currentProduct, id: String(context.currentProduct.id) }
          : undefined,
        context: context.context ? {
          ...context.context,
          currentProductId: context.context.currentProductId ? String(context.context.currentProductId) : undefined,
        } : undefined,
        salesSettings: salesSettings || undefined,
        recentOrderCount: recentOrderCount > 0 ? recentOrderCount : undefined,
      },
      conversationHistory,
      message,
      language
    );

    // Extract JSON action from AI response
    const { cleanResponse, action } = extractOrderAction(aiResponse);

    // Process order action if present
    let metadata: Record<string, unknown> | null = null;
    const storefrontSlug = (context as unknown as { storefrontSlug?: string }).storefrontSlug || '';

    if (action && action.orderAction !== 'none') {
      const result = await processOrderAction(
        action,
        context.context as Record<string, unknown> | undefined,
        context.products.map(p => ({
          ...p,
          id: String(p.id),
          sizes: p.sizes || undefined,
          colors: p.colors || undefined,
        })),
        storefrontSlug,
        conversationId as Id<'chatbotConversations'>,
        sessionId,
      );

      if (result.contextUpdates) {
        // Update context in Convex
        const existingContext = context.context || {};
        try {
          await getConvex().mutation(api.chatbot.updateContext, {
            conversationId: conversationId as Id<'chatbotConversations'>,
            sessionId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            context: { ...existingContext, ...result.contextUpdates } as any,
          });
        } catch (err) {
          console.error('Failed to update context:', err);
        }
      }

      metadata = result.metadata;
    }

    // Save bot response to Convex
    await getConvex().mutation(api.chatbot.addBotResponse, {
      conversationId: conversationId as Id<'chatbotConversations'>,
      content: cleanResponse,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: metadata ? metadata as any : undefined,
    });

    return NextResponse.json({ response: cleanResponse, metadata });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
