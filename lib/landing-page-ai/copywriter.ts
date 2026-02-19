// Copywriter AI - Generates Algerian Darija marketing copy for landing pages

import { VisionAnalysis } from './vision';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const COPYWRITER_MODEL = 'anthropic/claude-sonnet-4.5';

export interface ProductData {
  name: string;
  price: number;
  salePrice?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  categoryName?: string;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  featureBullets: Array<{ title: string; description: string }>;
  ctaText: string;
  urgencyText: string;
  productDescription: string;
  socialProof: string;
  // v3 fields
  testimonial?: { text: string; author: string; location: string };
  guaranteeText?: string;
  secondaryCta?: string;
  scarcityText?: string;
  microCopy?: { delivery: string; payment: string; returns: string };
}

export async function generateLandingPageCopy(
  product: ProductData,
  sellerPrompt: string,
  visionAnalysis: VisionAnalysis | null,
  apiKey: string
): Promise<LandingPageCopy | null> {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const systemPrompt = `You are a top-tier Algerian e-commerce copywriter. You write in ALGERIAN DARIJA (الدارجة الجزائرية) — NOT Modern Standard Arabic (MSA/فصحى).

CRITICAL RULE: The product name is "${product.name}". ALL text you write MUST be about THIS EXACT product. Do NOT invent a different product. Do NOT change the product type. If the product is a t-shirt, write about a t-shirt. If it's a cream, write about a cream.

DARIJA RULES:
1. Write in Darija as spoken in Algeria — mix Arabic script with French loanwords when natural
2. Use: "بزاف" (a lot), "واش" (what), "كاين" (there is), "هاذ" (this), "خلاص" (done), "صح" (true), "بصح" (but)
3. Include French loanwords naturally: "qualité", "livraison", "promotion", "gratuit", "offre"
4. Mention "الدفع عند الاستلام" (COD) and "توصيل لكل 58 ولاية" (delivery to all 58 wilayas)
5. Keep it punchy and conversational
6. Do NOT use emoji or icons in any text. No emoticons, no Unicode symbols.

HEADLINE FORMULAS (pick the best one for this product):
- Curiosity gap: "واش [unexpected claim]? هاذ [product] غير [result]..."
- Bold claim: "[Benefit] في [timeframe]"
- Pain point: "عييت من [problem]? [product] يخلصك"
- Number hook: "[Number] حوايج لي [product] يديرهم لك"

BENEFIT-FOCUSED BULLETS: Each bullet must use an emotional frame:
- Status: "صحابك يسقسوك وين شريت هاذ..."
- FOMO: "كل يوم بلا [product] راك خاسر..."
- Transformation: "من [before] ل [after]..."
- Ease: "بلا ما [difficulty], غير [simple action]..."

Return ONLY a JSON object:
{
  "headline": "Short punchy headline about ${product.name} in Darija (max 10 words)",
  "subheadline": "Value proposition for ${product.name} (max 20 words)",
  "featureBullets": [
    { "title": "Benefit title (2-4 words)", "description": "One sentence about what the customer gains from ${product.name}" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "ctaText": "CTA button text (2-4 words)",
  "urgencyText": "Urgency message",
  "productDescription": "2-3 sentences describing ${product.name} in Darija",
  "socialProof": "Social proof line",
  "testimonial": {
    "text": "A realistic customer testimonial in Darija (2-3 sentences, enthusiastic but believable)",
    "author": "Common Algerian first name",
    "location": "Real Algerian wilaya name"
  },
  "guaranteeText": "Return/guarantee promise in Darija (e.g. ارجع المنتوج في 7 ايام اذا ما عجبكش)",
  "secondaryCta": "Secondary CTA text for gallery section (2-4 words)",
  "scarcityText": "Stock-based scarcity line in Darija (e.g. غير 15 وحدة باقية)",
  "microCopy": {
    "delivery": "Short delivery trust line (e.g. توصيل سريع لباب دارك)",
    "payment": "Short payment trust line (e.g. الدفع عند الاستلام فقط)",
    "returns": "Short returns trust line (e.g. ارجاع مجاني)"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown. No emoji.`;

  const userLines = [
    `PRODUCT NAME: ${product.name}`,
    `PRICE: ${product.price} DZD${hasDiscount ? ` (SALE: ${product.salePrice} DZD, -${discountPercent}%)` : ''}`,
  ];

  if (sellerPrompt) {
    userLines.push(`SELLER DESCRIPTION: ${sellerPrompt}`);
  }
  if (product.description) {
    userLines.push(`PRODUCT DESCRIPTION: ${product.description}`);
  }
  if (product.sizes?.length) {
    userLines.push(`SIZES: ${product.sizes.join(', ')}`);
  }
  if (product.colors?.length) {
    userLines.push(`COLORS: ${product.colors.join(', ')}`);
  }
  if (product.categoryName) {
    userLines.push(`CATEGORY: ${product.categoryName}`);
  }

  userLines.push('', `Write a landing page for "${product.name}". Stay focused on this product ONLY.`);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ma5zani.com',
        'X-Title': 'ma5zani Landing Page AI',
      },
      body: JSON.stringify({
        model: COPYWRITER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userLines.join('\n') },
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Copywriter API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('Copywriter: No content in response', JSON.stringify(data).slice(0, 500));
      return null;
    }

    const jsonStr = extractJSON(content);
    const parsed = JSON.parse(jsonStr) as LandingPageCopy;

    // Ensure required fields exist (graceful fallback for partial responses)
    if (!parsed.headline || !parsed.ctaText || !parsed.productDescription) {
      console.error('Copywriter: Missing required fields in parsed JSON');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Copywriter error:', error);
    return null;
  }
}

function extractJSON(text: string): string {
  let cleaned = text.trim();
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }
  return cleaned;
}
