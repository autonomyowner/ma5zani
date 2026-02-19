// Copywriter AI - Generates Algerian Darija marketing copy for landing pages
// Now receives vision analysis to write accurate, product-aware copy

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

CRITICAL RULES:
- The product name is "${product.name}". ALL text MUST be about THIS EXACT product.
- Do NOT invent features the product doesn't have. Only describe what is provided in the product info below.
- If the seller provided a description, USE IT as the basis for your copy.
- If AI vision analysis is provided, USE IT to describe the product accurately (colors, materials, style).
- Do NOT use emoji or icons. No emoticons, no Unicode symbols.

DARIJA RULES:
1. Write in Darija as spoken in Algeria — mix Arabic script with French loanwords when natural
2. Use: "بزاف", "واش", "كاين", "هاذ", "خلاص", "صح", "بصح"
3. Include French loanwords naturally: "qualité", "livraison", "promotion", "gratuit", "offre"
4. Keep it punchy and conversational

COPY RULES:
- Headline: Short, punchy, about ${product.name} specifically (max 8 words)
- Feature bullets: Describe REAL benefits based on the product info given. Don't invent capabilities.
- productDescription: Accurately describe the product. Use the AI vision data if provided — mention actual colors, materials, style that were observed.
- Mention "الدفع عند الاستلام" (COD) and "توصيل لكل 58 ولاية" in the microCopy, NOT in the main copy.

Return ONLY a JSON object:
{
  "headline": "Short headline about ${product.name} in Darija (max 8 words)",
  "subheadline": "Value proposition (max 15 words)",
  "featureBullets": [
    { "title": "Benefit title (2-3 words)", "description": "One sentence about a REAL benefit" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "ctaText": "CTA button (2-3 words, e.g. اطلب الان)",
  "urgencyText": "Short urgency line",
  "productDescription": "2-3 sentences describing ${product.name} accurately based on all available info",
  "socialProof": "General trust line (e.g. +500 طلبية هاذ الشهر)",
  "guaranteeText": "Return/guarantee promise (e.g. ارجع المنتوج في 7 ايام اذا ما عجبكش)",
  "secondaryCta": "Secondary CTA (2-3 words)",
  "scarcityText": "Stock urgency (e.g. غير 15 وحدة باقية)",
  "microCopy": {
    "delivery": "توصيل سريع لباب دارك",
    "payment": "الدفع عند الاستلام",
    "returns": "ارجاع مجاني"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown. No emoji. No fake testimonials or reviews.`;

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

  // Feed vision analysis for product-aware copy
  if (visionAnalysis) {
    userLines.push('');
    userLines.push('--- AI VISION ANALYSIS (from analyzing the product image) ---');
    if (visionAnalysis.productDescription) {
      userLines.push(`WHAT THE AI SEES: ${visionAnalysis.productDescription}`);
    }
    if (visionAnalysis.visualAttributes?.length) {
      userLines.push(`VISUAL CHARACTERISTICS: ${visionAnalysis.visualAttributes.join(', ')}`);
    }
    if (visionAnalysis.productCategory) {
      userLines.push(`PRODUCT CATEGORY: ${visionAnalysis.productCategory}`);
    }
    if (visionAnalysis.productMood) {
      userLines.push(`PRODUCT STYLE: ${visionAnalysis.productMood}`);
    }
    if (visionAnalysis.dominantColors?.length) {
      userLines.push(`DOMINANT COLORS: ${visionAnalysis.dominantColors.join(', ')}`);
    }
    userLines.push('Use this vision data to write ACCURATE descriptions. Describe the product as it actually appears.');
    userLines.push('---');
  }

  userLines.push('', `Write a landing page for "${product.name}". Stay focused on this product ONLY. Be accurate about what the product looks like.`);

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
        temperature: 0.5,
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
