// Copywriter AI - Generates Algerian Darija marketing copy for landing pages

import { VisionAnalysis } from './vision';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const COPYWRITER_MODEL = 'anthropic/claude-3.5-sonnet';

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

Return ONLY a JSON object:
{
  "headline": "Short punchy headline about ${product.name} in Darija (max 10 words)",
  "subheadline": "Value proposition for ${product.name} (max 20 words)",
  "featureBullets": [
    { "title": "Benefit title (2-4 words)", "description": "One sentence about this benefit of ${product.name}" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "ctaText": "CTA button text (2-4 words)",
  "urgencyText": "Urgency message",
  "productDescription": "2-3 sentences describing ${product.name} in Darija",
  "socialProof": "Social proof line"
}

IMPORTANT: Return ONLY valid JSON. No markdown.`;

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
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Copywriter API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as LandingPageCopy;
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
