// Vision API - Analyzes product images for color palette

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const VISION_MODEL = 'google/gemini-2.0-flash-001';

export interface VisionAnalysis {
  dominantColors: string[];
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
  productName: string,
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
                text: `This is a product image for "${productName}". Extract ONLY colors for a landing page design. Return JSON:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "productType": "${productName}",
  "visualAttributes": ["3-5 adjectives"],
  "suggestedPalette": {
    "primary": "#hex - rich color from the product",
    "accent": "#hex - warm CTA color (orange or green)",
    "background": "#hex - light neutral (#f8f8f8 to #ffffff)",
    "text": "#hex - dark readable"
  }
}
Return ONLY valid JSON.`,
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
