// OpenRouter AI Integration for Chatbot

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-haiku';

interface AIContext {
  chatbot: {
    name: string;
    personality: 'friendly' | 'professional' | 'casual';
  };
  storefront: {
    name: string;
    description?: string;
  };
  seller?: {
    name: string;
    phone?: string;
  };
  knowledge: Array<{
    category: string;
    question: string;
    answer: string;
    keywords: string[];
  }>;
  products: Array<{
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    description?: string;
    stock: number;
    status: string;
  }>;
  currentProduct?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    description?: string;
    stock: number;
  };
  context?: {
    currentProductId?: string;
    cartItems?: string[];
    wilaya?: string;
  };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(context: AIContext, language: 'ar' | 'en'): string {
  const { chatbot, storefront, seller, knowledge, products, currentProduct } = context;

  const personalityTraits = {
    friendly: language === 'ar'
      ? 'ودود ومرحب، استخدم لغة دافئة وإيجابية'
      : 'warm and welcoming, use friendly and positive language',
    professional: language === 'ar'
      ? 'محترف ومهذب، استخدم لغة رسمية ودقيقة'
      : 'professional and polite, use formal and precise language',
    casual: language === 'ar'
      ? 'عفوي ومريح، استخدم لغة بسيطة وغير رسمية'
      : 'casual and relaxed, use simple informal language',
  };

  const systemPrompt = language === 'ar' ? `
أنت ${chatbot.name}، مساعد تسوق ذكي لمتجر "${storefront.name}".

## شخصيتك
${personalityTraits[chatbot.personality]}

## معلومات المتجر
- اسم المتجر: ${storefront.name}
${storefront.description ? `- الوصف: ${storefront.description}` : ''}
${seller?.phone ? `- للتواصل: ${seller.phone}` : ''}

## قاعدة المعرفة
${knowledge.length > 0 ? knowledge.map(k => `
السؤال: ${k.question}
الإجابة: ${k.answer}
`).join('\n') : 'لا توجد معلومات مخصصة بعد.'}

## المنتجات المتوفرة
${products.slice(0, 10).map(p => `- ${p.name}: ${p.salePrice || p.price} دج ${p.stock < 5 ? '(كمية محدودة)' : ''}`).join('\n')}

${currentProduct ? `
## المنتج الحالي الذي يتصفحه العميل
- ${currentProduct.name}
- السعر: ${currentProduct.salePrice || currentProduct.price} دج
- الوصف: ${currentProduct.description || 'لا يوجد وصف'}
- المخزون: ${currentProduct.stock} قطعة
` : ''}

## التعليمات
1. أجب بإيجاز ووضوح (جملة أو جملتين كحد أقصى)
2. إذا سأل العميل عن منتج غير موجود، اقترح بدائل من القائمة
3. شجع العميل على إتمام الطلب بلطف
4. إذا لم تعرف الإجابة، اعتذر واقترح التحدث مع فريق الدعم
5. استخدم اللغة العربية فقط

تذكر: أنت تمثل المتجر، كن مفيداً ومهنياً.
` : `
You are ${chatbot.name}, a smart shopping assistant for "${storefront.name}".

## Your Personality
${personalityTraits[chatbot.personality]}

## Store Information
- Store name: ${storefront.name}
${storefront.description ? `- Description: ${storefront.description}` : ''}
${seller?.phone ? `- Contact: ${seller.phone}` : ''}

## Knowledge Base
${knowledge.length > 0 ? knowledge.map(k => `
Q: ${k.question}
A: ${k.answer}
`).join('\n') : 'No custom information yet.'}

## Available Products
${products.slice(0, 10).map(p => `- ${p.name}: ${p.salePrice || p.price} DZD ${p.stock < 5 ? '(limited stock)' : ''}`).join('\n')}

${currentProduct ? `
## Current Product Customer is Viewing
- ${currentProduct.name}
- Price: ${currentProduct.salePrice || currentProduct.price} DZD
- Description: ${currentProduct.description || 'No description'}
- Stock: ${currentProduct.stock} units
` : ''}

## Instructions
1. Keep responses brief and clear (1-2 sentences max)
2. If asked about unavailable products, suggest alternatives from the list
3. Gently encourage completing the purchase
4. If unsure, apologize and suggest talking to support team
5. Use the same language as the customer

Remember: You represent the store, be helpful and professional.
`;

  return systemPrompt;
}

export async function generateAIResponse(
  context: AIContext,
  conversationHistory: Array<{ sender: string; content: string }>,
  customerMessage: string,
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return language === 'ar'
      ? 'عذراً، حدث خطأ. يرجى المحاولة لاحقاً أو التحدث مع فريق الدعم.'
      : 'Sorry, an error occurred. Please try again later or talk to our support team.';
  }

  const systemPrompt = buildSystemPrompt(context, language);

  // Build conversation messages
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add recent conversation history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.sender === 'customer' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add current message
  messages.push({ role: 'user', content: customerMessage });

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ma5zani.com',
        'X-Title': 'ma5zani Chatbot',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error('API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return aiResponse.trim();
  } catch (error) {
    console.error('AI generation error:', error);
    return language === 'ar'
      ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
      : 'Sorry, a connection error occurred. Please try again.';
  }
}

export async function detectLanguage(text: string): Promise<'ar' | 'en'> {
  // Simple detection based on Arabic characters
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? 'ar' : 'en';
}
