// Vision API - Analyzes product images for color palette and product attributes

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const VISION_MODEL = 'google/gemini-2.0-flash-001';

export interface VisionAnalysis {
  dominantColors: string[]; // hex colors
  productType: string;
  visualAttributes: string[];
  suggestedPalette: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export async function analyzeProductImage(
  imageUrl: string,
  apiKey: string
): Promise<VisionAnalysis | null> {
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
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
              {
                type: 'text',
                text: `Analyze this product image. Return ONLY a JSON object with these exact fields:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "productType": "brief product category (e.g. clothing, electronics, cosmetics, food, accessories)",
  "visualAttributes": ["list", "of", "visual", "qualities"],
  "suggestedPalette": {
    "primary": "#hex - a rich color inspired by the product",
    "accent": "#hex - a contrasting CTA color (warm orange or bright green work best)",
    "background": "#hex - light neutral background",
    "text": "#hex - dark readable text color"
  }
}

Rules:
- dominantColors: extract 3 most prominent colors from the product itself
- productType: one brief phrase
- visualAttributes: 3-5 adjectives describing the product look (e.g. "elegant", "modern", "handmade")
- suggestedPalette: colors that would make a high-converting landing page for this product
- accent should be a warm, attention-grabbing color for CTA buttons
- background should be light (#f8f8f8 to #ffffff range)
- Return ONLY valid JSON, no markdown or explanations`,
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Vision API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Parse JSON from response
    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as VisionAnalysis;
  } catch (error) {
    console.error('Vision analysis error:', error);
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
