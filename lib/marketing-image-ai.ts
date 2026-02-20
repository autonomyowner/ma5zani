// Marketing Image AI — Short copy generator for marketing images
// Generates punchy Darija headline + subheadline via Claude on OpenRouter

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-sonnet';

export interface MarketingCopy {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export async function generateMarketingCopy(
  productName: string,
  price: number,
  salePrice?: number,
  description?: string,
): Promise<MarketingCopy | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const systemPrompt = `You write SHORT marketing text in Algerian Darija for product ads.

RULES:
- headline: 3-6 words max, punchy, uses Darija
- subheadline: 8-15 words, value proposition in Darija
- ctaText: 2-4 words, call to action in Darija (e.g. "اطلب دروك", "شري هنا", "احجز تاعك")
- Use Darija words: "بزاف", "واش", "كاين", "هاذ", "صح"
- Mix French loanwords naturally: "qualité", "livraison", "promotion"
- NO emoji, NO icons, NO hashtags
- Focus on BENEFITS not features

Return ONLY valid JSON: {"headline": "...", "subheadline": "...", "ctaText": "..."}`;

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
  userLines.push('', 'Write a headline + subheadline for a marketing image ad.');

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ma5zani.com',
        'X-Title': 'ma5zani Marketing Image AI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userLines.join('\n') },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Marketing copy API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as MarketingCopy;
  } catch (error) {
    console.error('Marketing copy error:', error);
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
