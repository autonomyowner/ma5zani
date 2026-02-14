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
  visionAnalysis: VisionAnalysis | null,
  apiKey: string
): Promise<LandingPageCopy | null> {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const productContext = `
Product: ${product.name}
Price: ${product.price} DZD${hasDiscount ? ` (Sale: ${product.salePrice} DZD, -${discountPercent}%)` : ''}
${product.description ? `Description: ${product.description}` : ''}
${product.sizes?.length ? `Sizes: ${product.sizes.join(', ')}` : ''}
${product.colors?.length ? `Colors: ${product.colors.join(', ')}` : ''}
${product.categoryName ? `Category: ${product.categoryName}` : ''}
${visionAnalysis ? `Visual: ${visionAnalysis.productType}, looks ${visionAnalysis.visualAttributes.join(', ')}` : ''}
`.trim();

  const systemPrompt = `You are a top-tier Algerian e-commerce copywriter. You write in ALGERIAN DARIJA (الدارجة الجزائرية) — NOT Modern Standard Arabic (MSA/فصحى).

KEY RULES:
1. Write in Darija as spoken in Algeria — mix Arabic script with French loanwords when natural
2. Use words like: "بزاف" (a lot), "واش" (what), "كاين" (there is), "هاذ" (this), "خلاص" (done/already), "يخطيك" (please), "صح" (right/true), "بصح" (but), "كيفاش" (how), "علاش" (why)
3. Include French loanwords naturally: "qualité", "livraison", "promotion", "gratuit", "offre"
4. Mention "الدفع عند الاستلام" (COD/Cash on Delivery) — this is critical for Algerian buyers
5. Mention "توصيل لكل 58 ولاية" (delivery to all 58 wilayas)
6. Keep it punchy, persuasive, and conversational — like talking to a friend
7. Use urgency and scarcity naturally

Return ONLY a JSON object with these exact fields:
{
  "headline": "Short, punchy main headline in Darija (max 10 words)",
  "subheadline": "Supporting line that adds value proposition (max 20 words)",
  "featureBullets": [
    { "title": "Short benefit title (2-4 words)", "description": "One sentence explaining the benefit" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "ctaText": "CTA button text (2-4 words, action-oriented)",
  "urgencyText": "Urgency/scarcity message (e.g. limited stock, time-limited offer)",
  "productDescription": "2-3 sentences describing the product in compelling Darija",
  "socialProof": "Social proof line (e.g. +500 client satisfied)"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations.`;

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
          { role: 'user', content: `Write landing page copy for this product:\n\n${productContext}` },
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
