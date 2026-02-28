// OpenRouter AI Integration for Chatbot

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-haiku';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
}

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
    sizes?: string[];
    colors?: string[];
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
    orderState?: string;
    orderItems?: OrderItem[];
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryType?: string;
    commune?: string;
    deliveryFee?: number;
  };
  salesSettings?: {
    intensity: 'gentle' | 'balanced' | 'aggressive';
    autoFollowUp: boolean;
    maxDiscountPercent?: number;
  };
  recentOrderCount?: number;
  customerProfile?: {
    name?: string;
    wilaya?: string;
    orderHistory: Array<{ productName: string; date: number }>;
    interests: string[];
  };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildOrderStatePrompt(context: AIContext, language: 'ar' | 'en'): string {
  const orderCtx = context.context;
  if (!orderCtx?.orderState || orderCtx.orderState === 'idle') return '';

  const items = orderCtx.orderItems || [];

  if (language === 'ar') {
    let prompt = `\n## حالة الطلب الحالي\n`;
    prompt += `- الحالة: ${orderCtx.orderState}\n`;
    if (items.length > 0) {
      prompt += `- المنتجات المختارة:\n`;
      items.forEach(item => {
        prompt += `  * ${item.productName} x${item.quantity} = ${item.unitPrice * item.quantity} دج`;
        if (item.selectedSize) prompt += ` (مقاس: ${item.selectedSize})`;
        if (item.selectedColor) prompt += ` (لون: ${item.selectedColor})`;
        prompt += '\n';
      });
    }
    if (orderCtx.customerName) prompt += `- اسم العميل: ${orderCtx.customerName}\n`;
    if (orderCtx.customerPhone) prompt += `- الهاتف: ${orderCtx.customerPhone}\n`;
    if (orderCtx.wilaya) prompt += `- الولاية: ${orderCtx.wilaya}\n`;
    if (orderCtx.deliveryAddress) prompt += `- العنوان: ${orderCtx.deliveryAddress}\n`;
    if (orderCtx.deliveryFee) prompt += `- رسوم التوصيل: ${orderCtx.deliveryFee} دج\n`;
    return prompt;
  }

  let prompt = `\n## Current Order State\n`;
  prompt += `- State: ${orderCtx.orderState}\n`;
  if (items.length > 0) {
    prompt += `- Selected items:\n`;
    items.forEach(item => {
      prompt += `  * ${item.productName} x${item.quantity} = ${item.unitPrice * item.quantity} DZD`;
      if (item.selectedSize) prompt += ` (size: ${item.selectedSize})`;
      if (item.selectedColor) prompt += ` (color: ${item.selectedColor})`;
      prompt += '\n';
    });
  }
  if (orderCtx.customerName) prompt += `- Customer name: ${orderCtx.customerName}\n`;
  if (orderCtx.customerPhone) prompt += `- Phone: ${orderCtx.customerPhone}\n`;
  if (orderCtx.wilaya) prompt += `- Wilaya: ${orderCtx.wilaya}\n`;
  if (orderCtx.deliveryAddress) prompt += `- Address: ${orderCtx.deliveryAddress}\n`;
  if (orderCtx.deliveryFee) prompt += `- Delivery fee: ${orderCtx.deliveryFee} DZD\n`;
  return prompt;
}

function buildSalesContext(context: AIContext, language: 'ar' | 'en'): string {
  const settings = context.salesSettings;
  if (!settings) return '';

  const intensity = settings.intensity || 'balanced';
  const lowStockProducts = context.products.filter(p => p.stock > 0 && p.stock < 10);
  const saleProducts = context.products.filter(p => p.salePrice && p.salePrice < p.price);

  if (language === 'ar') {
    let prompt = '\n## قواعد البيع والإغلاق\n';

    // Intensity-specific rules
    if (intensity === 'gentle') {
      prompt += `- اقترح المنتجات بلطف دون إلحاح\n`;
      prompt += `- اذكر المخزون المحدود بشكل طبيعي فقط عند السؤال\n`;
      prompt += `- لا تستخدم لغة استعجال\n`;
      prompt += `- دع العميل يقرر بنفسه\n`;
    } else if (intensity === 'balanced') {
      prompt += `- اقترح الشراء بعد 2-3 رسائل من المحادثة\n`;
      prompt += `- اذكر مستويات المخزون عند الحاجة\n`;
      prompt += `- استخدم لغة استعجال خفيفة\n`;
      prompt += `- اقترح منتجات مكملة عند الإمكان\n`;
    } else if (intensity === 'aggressive') {
      prompt += `- ادفع نحو الشراء في كل تبادل\n`;
      prompt += `- استخدم لغة استعجال قوية\n`;
      prompt += `- اقترح عروض حزم ومنتجات إضافية\n`;
      prompt += `- ذكّر بالمخزون المحدود والعروض الحالية\n`;
    }

    prompt += `\n### التعامل مع الاعتراضات\n`;
    prompt += `- إذا قال العميل "غالي": قسّم السعر على أيام الاستخدام، اقترح بدائل أرخص\n`;
    prompt += `- إذا قال "مش متأكد": اذكر عدد العملاء الراضين وسياسة الاسترجاع\n`;
    prompt += `- إذا قال "لازم نفكر": احفظ السلة واعرض المتابعة لاحقاً\n`;

    prompt += `\n### الإلحاح الصادق (بيانات حقيقية فقط)\n`;
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(p => {
        prompt += `- ${p.name}: باقي ${p.stock} قطع فقط\n`;
      });
    }
    if (context.recentOrderCount && context.recentOrderCount > 0) {
      prompt += `- تم بيع ${context.recentOrderCount} طلب مؤخراً\n`;
    }
    prompt += `- لا تكذب أبداً بشأن المخزون أو المراجعات\n`;

    if (saleProducts.length > 0) {
      prompt += `\n### العروض الحالية\n`;
      saleProducts.forEach(p => {
        const discount = Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100);
        prompt += `- ${p.name}: ${p.salePrice} دج بدلاً من ${p.price} دج (خصم ${discount}%)\n`;
      });
    }

    prompt += `\n### البيع المتقاطع\n`;
    prompt += `- بعد إضافة منتج: اقترح منتجات مكملة من نفس الفئة\n`;
    prompt += `- اعرض التوصيل المجاني إذا أضاف منتج آخر (إن وجد)\n`;

    prompt += `\n### دفع الشراء\n`;
    if (intensity !== 'gentle') {
      prompt += `- بعد 2-3 رسائل بدون نية شراء: "تحب نبدالك الطلب؟"\n`;
    }
    if (context.customerProfile?.orderHistory?.length) {
      prompt += `- للعميل العائد: "نفس الطلبية السابقة؟"\n`;
    }

    if (settings.maxDiscountPercent && settings.maxDiscountPercent > 0) {
      prompt += `\n### الخصومات\n`;
      prompt += `- يمكنك عرض خصم حتى ${settings.maxDiscountPercent}% إذا تردد العميل\n`;
      prompt += `- لا تعرض الخصم مباشرة، انتظر حتى يعترض العميل على السعر\n`;
    }

    // Customer profile context
    if (context.customerProfile) {
      prompt += `\n### معلومات العميل\n`;
      if (context.customerProfile.name) {
        prompt += `- الاسم: ${context.customerProfile.name}\n`;
      }
      if (context.customerProfile.wilaya) {
        prompt += `- الولاية: ${context.customerProfile.wilaya}\n`;
      }
      if (context.customerProfile.orderHistory.length > 0) {
        prompt += `- عميل عائد! طلبات سابقة:\n`;
        context.customerProfile.orderHistory.slice(-3).forEach(o => {
          prompt += `  * ${o.productName}\n`;
        });
      }
      if (context.customerProfile.interests.length > 0) {
        prompt += `- اهتمامات: ${context.customerProfile.interests.join(', ')}\n`;
      }
    }

    return prompt;
  }

  // English version
  let prompt = '\n## Sales Closing Rules\n';

  if (intensity === 'gentle') {
    prompt += `- Suggest products gently without pushing\n`;
    prompt += `- Only mention limited stock naturally when asked\n`;
    prompt += `- No urgency language\n`;
    prompt += `- Let the customer decide on their own\n`;
  } else if (intensity === 'balanced') {
    prompt += `- Suggest purchases after 2-3 message exchanges\n`;
    prompt += `- Mention stock levels when relevant\n`;
    prompt += `- Use light urgency language\n`;
    prompt += `- Suggest complementary products when possible\n`;
  } else if (intensity === 'aggressive') {
    prompt += `- Push toward purchase in every exchange\n`;
    prompt += `- Use strong urgency language\n`;
    prompt += `- Suggest bundle deals and additional products\n`;
    prompt += `- Remind about limited stock and current offers\n`;
  }

  prompt += `\n### Handling Objections\n`;
  prompt += `- If customer says "too expensive": Break down price per day of use, suggest cheaper alternatives\n`;
  prompt += `- If customer says "not sure": Mention satisfied customers and return policy\n`;
  prompt += `- If customer says "need to think": Save cart and offer to follow up later\n`;

  prompt += `\n### Honest Urgency (real data only)\n`;
  if (lowStockProducts.length > 0) {
    lowStockProducts.forEach(p => {
      prompt += `- ${p.name}: Only ${p.stock} units left\n`;
    });
  }
  if (context.recentOrderCount && context.recentOrderCount > 0) {
    prompt += `- ${context.recentOrderCount} orders placed recently\n`;
  }
  prompt += `- Never lie about stock or reviews\n`;

  if (saleProducts.length > 0) {
    prompt += `\n### Current Offers\n`;
    saleProducts.forEach(p => {
      const discount = Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100);
      prompt += `- ${p.name}: ${p.salePrice} DZD instead of ${p.price} DZD (${discount}% off)\n`;
    });
  }

  prompt += `\n### Cross-selling\n`;
  prompt += `- After adding a product: Suggest complementary products from the same category\n`;
  prompt += `- Offer free delivery if they add another product (if applicable)\n`;

  prompt += `\n### Purchase Nudge\n`;
  if (intensity !== 'gentle') {
    prompt += `- After 2-3 messages without purchase intent: "Would you like me to start your order?"\n`;
  }
  if (context.customerProfile?.orderHistory?.length) {
    prompt += `- For returning customer: "Same as your last order?"\n`;
  }

  if (settings.maxDiscountPercent && settings.maxDiscountPercent > 0) {
    prompt += `\n### Discounts\n`;
    prompt += `- You can offer up to ${settings.maxDiscountPercent}% discount if the customer hesitates\n`;
    prompt += `- Don't offer the discount right away, wait until they object to the price\n`;
  }

  // Customer profile context
  if (context.customerProfile) {
    prompt += `\n### Customer Info\n`;
    if (context.customerProfile.name) {
      prompt += `- Name: ${context.customerProfile.name}\n`;
    }
    if (context.customerProfile.wilaya) {
      prompt += `- Wilaya: ${context.customerProfile.wilaya}\n`;
    }
    if (context.customerProfile.orderHistory.length > 0) {
      prompt += `- Returning customer! Previous orders:\n`;
      context.customerProfile.orderHistory.slice(-3).forEach(o => {
        prompt += `  * ${o.productName}\n`;
      });
    }
    if (context.customerProfile.interests.length > 0) {
      prompt += `- Interests: ${context.customerProfile.interests.join(', ')}\n`;
    }
  }

  return prompt;
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

  const orderStatePrompt = buildOrderStatePrompt(context, language);
  const salesContextPrompt = buildSalesContext(context, language);

  const productListAr = products.slice(0, 15).map(p => {
    let line = `- [${p.id}] ${p.name}: ${p.salePrice || p.price} دج`;
    if (p.stock < 5) line += ' (كمية محدودة)';
    if (p.sizes?.length) line += ` | المقاسات: ${p.sizes.join(', ')}`;
    if (p.colors?.length) line += ` | الألوان: ${p.colors.join(', ')}`;
    return line;
  }).join('\n');

  const productListEn = products.slice(0, 15).map(p => {
    let line = `- [${p.id}] ${p.name}: ${p.salePrice || p.price} DZD`;
    if (p.stock < 5) line += ' (limited stock)';
    if (p.sizes?.length) line += ` | Sizes: ${p.sizes.join(', ')}`;
    if (p.colors?.length) line += ` | Colors: ${p.colors.join(', ')}`;
    return line;
  }).join('\n');

  const orderSystemAr = `
## نظام أخذ الطلبات
أنت قادر على أخذ الطلبات مباشرة من العملاء. اتبع هذه الخطوات:
1. عندما يريد العميل طلب منتج، حدد المنتج من القائمة
2. إذا كان للمنتج مقاسات أو ألوان، اسأل العميل عن اختياره
3. اجمع المعلومات بالترتيب: الاسم الكامل ← رقم الهاتف (يبدأ بـ 05 أو 06 أو 07) ← الولاية ← عنوان التوصيل
4. عند اكتمال المعلومات، اعرض ملخص الطلب واطلب التأكيد
5. لا تطلب معلومة تم جمعها بالفعل

**مهم**: في نهاية كل رد، أضف كتلة JSON مخفية بهذا الشكل:
\`\`\`json
{"orderAction":"none","data":{}}
\`\`\`

القيم المتاحة لـ orderAction:
- "none" — رسالة عادية بدون تغيير في الطلب
- "start" — العميل يريد بدء طلب
- "add_item" — إضافة منتج: data يحتوي على { "productId": "...", "productName": "...", "quantity": 1, "selectedSize": "...", "selectedColor": "..." }
- "set_info" — تعيين معلومات: data يحتوي على { "customerName": "...", "customerPhone": "...", "wilaya": "...", "deliveryAddress": "..." } (الحقول المتوفرة فقط)
- "request_confirm" — عرض ملخص الطلب للتأكيد (عندما تكتمل كل المعلومات)
- "confirm" — العميل أكد الطلب
- "cancel" — العميل ألغى الطلب
`;

  const orderSystemEn = `
## Order-Taking System
You can take orders directly from customers. Follow these steps:
1. When a customer wants to order a product, identify it from the product list
2. If the product has sizes or colors, ask the customer for their choice
3. Collect info in order: full name -> phone number (must start with 05, 06, or 07) -> wilaya -> delivery address
4. When all info is collected, present the order summary and ask for confirmation
5. Don't ask for info that's already been collected

**Important**: At the end of every response, add a hidden JSON block like this:
\`\`\`json
{"orderAction":"none","data":{}}
\`\`\`

Available orderAction values:
- "none" — normal message, no order state change
- "start" — customer wants to start an order
- "add_item" — add product: data contains { "productId": "...", "productName": "...", "quantity": 1, "selectedSize": "...", "selectedColor": "..." }
- "set_info" — set info: data contains { "customerName": "...", "customerPhone": "...", "wilaya": "...", "deliveryAddress": "..." } (only available fields)
- "request_confirm" — show order summary for confirmation (when all info is collected)
- "confirm" — customer confirmed the order
- "cancel" — customer cancelled the order
`;

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
${productListAr}

${currentProduct ? `
## المنتج الحالي الذي يتصفحه العميل
- ${currentProduct.name}
- السعر: ${currentProduct.salePrice || currentProduct.price} دج
- الوصف: ${currentProduct.description || 'لا يوجد وصف'}
- المخزون: ${currentProduct.stock} قطعة
` : ''}
${orderStatePrompt}
${orderSystemAr}

## التعليمات
1. أجب بإيجاز ووضوح (جملة أو جملتين كحد أقصى)
2. إذا سأل العميل عن منتج غير موجود، اقترح بدائل من القائمة
3. شجع العميل على إتمام الطلب بلطف
4. إذا لم تعرف الإجابة، اعتذر واقترح التحدث مع فريق الدعم
5. استخدم اللغة العربية فقط
6. أضف دائماً كتلة JSON في نهاية كل رد
${salesContextPrompt}
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
${productListEn}

${currentProduct ? `
## Current Product Customer is Viewing
- ${currentProduct.name}
- Price: ${currentProduct.salePrice || currentProduct.price} DZD
- Description: ${currentProduct.description || 'No description'}
- Stock: ${currentProduct.stock} units
` : ''}
${orderStatePrompt}
${orderSystemEn}

## Instructions
1. Keep responses brief and clear (1-2 sentences max)
2. If asked about unavailable products, suggest alternatives from the list
3. Gently encourage completing the purchase
4. If unsure, apologize and suggest talking to support team
5. Use the same language as the customer
6. Always add a JSON block at the end of every response
${salesContextPrompt}
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

  // Add recent conversation history (last 10 messages for order context)
  const recentHistory = conversationHistory.slice(-10);
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
        max_tokens: 500,
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
