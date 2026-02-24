// Marketing Poster AI — Full 7-section Darija copy generator for promo posters
// Generates PosterCopy via Claude on OpenRouter, using vision data for context

import type { PosterCopy } from '@/components/marketing-image/templates';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-sonnet-4-5';

interface PosterCopyInput {
  productName: string;
  price: number;
  salePrice?: number;
  description?: string;
  visionData?: {
    productDescription?: string;
    visualAttributes?: string[];
    productCategory?: string;
    suggestedFeatures?: string[];
  };
}

export async function generatePosterCopy(input: PosterCopyInput): Promise<PosterCopy | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const { productName, price, salePrice, description, visionData } = input;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const systemPrompt = `You write FULL promotional poster copy in Algerian Darija for product ads.

RULES:
- hookHeadline: 3-6 words max, punchy attention-grabbing hook in Darija
- subheadline: 8-15 words, value proposition in Darija
- problem: A pain point question the customer relates to (e.g. "واش تعبت تدور على qualité صح؟" or "ملقيت حتى منتج يدوم معاك؟")
- solution: A positive answer statement (e.g. "مع هاذ المنتج، حياتك تتبدّل" or "الحل هنا — qualité عالية بسعر معقول")
- features: Array of exactly 4 benefit strings in Darija (3-8 words each). Rewrite the suggested features in Darija style.
- trustBadges: Array of exactly 3 trust signals in Darija (e.g. "توصيل لكل 58 ولاية", "الدفع عند الاستلام", "ضمان الجودة", "إرجاع مجاني")
- ctaText: 2-4 words CTA in Darija (e.g. "اطلب دروك", "شري هنا", "احجز تاعك")

STYLE:
- Use Darija words naturally: "بزاف", "واش", "كاين", "هاذ", "صح", "دروك", "تاع"
- Mix French loanwords where natural: "qualité", "livraison", "promotion", "gratuit"
- NO emoji, NO icons, NO hashtags
- Focus on BENEFITS not technical specs
- Be direct, confident, aspirational

Return ONLY valid JSON:
{
  "hookHeadline": "...",
  "subheadline": "...",
  "problem": "...",
  "solution": "...",
  "features": ["...", "...", "...", "..."],
  "trustBadges": ["...", "...", "..."],
  "ctaText": "..."
}`;

  const userLines = [
    `Product: ${productName}`,
    `Price: ${price} DZD`,
  ];
  if (hasDiscount) {
    userLines.push(`Sale price: ${salePrice} DZD (-${discountPercent}%)`);
  }
  if (description) {
    userLines.push(`Description: ${description}`);
  }
  if (visionData?.productDescription) {
    userLines.push(`Visual analysis: ${visionData.productDescription}`);
  }
  if (visionData?.visualAttributes?.length) {
    userLines.push(`Visual attributes: ${visionData.visualAttributes.join(', ')}`);
  }
  if (visionData?.productCategory) {
    userLines.push(`Category: ${visionData.productCategory}`);
  }
  if (visionData?.suggestedFeatures?.length) {
    userLines.push(`Suggested features to rewrite in Darija: ${visionData.suggestedFeatures.join(' | ')}`);
  }
  userLines.push('', 'Write the full poster copy for a 1080x1920 promotional poster.');

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ma5zani.com',
        'X-Title': 'ma5zani Marketing Poster AI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userLines.join('\n') },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Poster copy API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonStr = extractJSON(content);
    const parsed = JSON.parse(jsonStr) as PosterCopy;

    // Ensure arrays have correct lengths
    if (!parsed.features || parsed.features.length < 4) {
      parsed.features = [
        ...(parsed.features || []),
        'جودة عالية مضمونة',
        'تصميم عصري وأنيق',
        'راحة كل يوم',
        'يدوم معاك بزاف',
      ].slice(0, 4);
    }
    if (!parsed.trustBadges || parsed.trustBadges.length < 3) {
      parsed.trustBadges = [
        ...(parsed.trustBadges || []),
        'توصيل لكل 58 ولاية',
        'الدفع عند الاستلام',
        'ضمان الجودة',
      ].slice(0, 3);
    }

    return parsed;
  } catch (error) {
    console.error('Poster copy error:', error);
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
