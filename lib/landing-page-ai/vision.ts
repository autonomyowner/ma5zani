// Vision API - Analyzes product images for color palette

import { adjustForContrast, generateGradient } from './contrast';

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
  scenePrompt?: string;
  productCategory?: string;
  scenePrompts?: string[];
  templateType?: string;
  productMood?: string;
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
                text: `This is a product image for "${productName}". Analyze it for a premium landing page design. Return JSON:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "productType": "${productName}",
  "productCategory": "specific type (e.g. face cream, wireless headphones, sneakers, gold necklace)",
  "visualAttributes": ["3-5 adjectives describing look/feel"],
  "productMood": "luxury | casual | professional | fun | natural",
  "suggestedPalette": {
    "primary": "#hex - rich color from the product",
    "accent": "#hex - warm CTA color (orange or green)",
    "background": "#hex - light neutral (#f8f8f8 to #ffffff)",
    "text": "#hex - dark readable"
  },
  "templateType": "lifestyle-hero | editorial | product-spotlight (pick ONE: beauty/fashion/food=lifestyle-hero, luxury/jewelry/accessories=editorial, electronics/tech/sports=product-spotlight)",
  "scenePrompts": [
    "HERO: premium product photography of ${productName} on elegant surface, soft studio lighting, clean background, commercial quality, 4k",
    "LIFESTYLE: ${productName} being used in real context, warm natural lighting, blurred lifestyle background, commercial photography, 4k",
    "DETAIL: close-up detail shot of ${productName}, studio macro photography, sharp focus, premium texture visible, 4k"
  ]
}
IMPORTANT: scenePrompts must describe the product IN a scene - include surface, lighting, mood. Return ONLY valid JSON.`,
              },
            ],
          },
        ],
        max_tokens: 900,
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

    const parsed = JSON.parse(extractJSON(content)) as VisionAnalysis;

    // Ensure scenePrompts fallback
    if (!parsed.scenePrompts || parsed.scenePrompts.length < 3) {
      parsed.scenePrompts = getDefaultScenePrompts(productName);
    }

    // Default templateType if missing
    if (!parsed.templateType || !['lifestyle-hero', 'editorial', 'product-spotlight'].includes(parsed.templateType)) {
      parsed.templateType = 'lifestyle-hero';
    }

    // Post-process: validate contrast and generate gradient
    const adjusted = adjustForContrast({
      primaryColor: parsed.suggestedPalette.primary,
      accentColor: parsed.suggestedPalette.accent,
      backgroundColor: parsed.suggestedPalette.background,
      textColor: parsed.suggestedPalette.text,
    });
    parsed.suggestedPalette.primary = adjusted.primaryColor;
    parsed.suggestedPalette.accent = adjusted.accentColor;
    parsed.suggestedPalette.background = adjusted.backgroundColor;
    parsed.suggestedPalette.text = adjusted.textColor;

    // Add gradient info
    const gradient = generateGradient(parsed.suggestedPalette.primary);
    (parsed as VisionAnalysis & { gradient?: { gradientFrom: string; gradientTo: string } }).gradient = gradient;

    return parsed;
  } catch (error) {
    console.error('Vision analysis error:', error);
    return null;
  }
}

/**
 * Enhanced vision analysis for marketing images — returns palette + scene prompt
 * for lifestyle image generation. The scene prompt describes an ideal photography
 * setup for the product.
 */
export async function analyzeProductForMarketing(
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
        'X-Title': 'ma5zani Marketing Image AI',
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
                text: `This is a product image for "${productName}". Analyze it for creating a professional marketing image.

Return JSON with:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "productType": "category (e.g. skincare, electronics, clothing, food, accessories)",
  "productCategory": "specific type (e.g. face cream, wireless headphones, sneakers)",
  "visualAttributes": ["3-5 adjectives describing the product look"],
  "suggestedPalette": {
    "primary": "#hex - rich color from the product for backgrounds",
    "accent": "#hex - warm CTA color (orange, coral, or green)",
    "background": "#hex - light neutral (#f8f8f8 to #ffffff)",
    "text": "#hex - dark readable"
  },
  "scenePrompt": "A detailed scene description for AI image generation. Describe a professional product photography scene that would suit this product. Include: surface material, lighting type, props, mood. Example: 'premium skincare product elegantly placed on white marble surface, soft diffused natural window lighting, eucalyptus sprigs and water droplets, clean minimalist spa aesthetic, commercial product photography, shallow depth of field, 4k ultra detailed'"
}
Return ONLY valid JSON.`,
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      console.error('Marketing vision API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(extractJSON(content)) as VisionAnalysis;

    // Post-process: validate contrast
    const adjusted = adjustForContrast({
      primaryColor: parsed.suggestedPalette.primary,
      accentColor: parsed.suggestedPalette.accent,
      backgroundColor: parsed.suggestedPalette.background,
      textColor: parsed.suggestedPalette.text,
    });
    parsed.suggestedPalette.primary = adjusted.primaryColor;
    parsed.suggestedPalette.accent = adjusted.accentColor;
    parsed.suggestedPalette.background = adjusted.backgroundColor;
    parsed.suggestedPalette.text = adjusted.textColor;

    const gradient = generateGradient(parsed.suggestedPalette.primary);
    (parsed as VisionAnalysis & { gradient?: { gradientFrom: string; gradientTo: string } }).gradient = gradient;

    return parsed;
  } catch (error) {
    console.error('Marketing vision analysis error:', error);
    return null;
  }
}

export function getDefaultScenePrompts(productName: string): string[] {
  return [
    `professional product photography of ${productName}, elegant studio setup, soft lighting, white marble surface, commercial quality, 4k`,
    `${productName} in lifestyle context, warm natural lighting, blurred background, commercial photography, 4k`,
    `close-up detail shot of ${productName}, studio macro photography, sharp focus, premium quality, 4k`,
  ];
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
