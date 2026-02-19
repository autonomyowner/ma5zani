// Vision API - Analyzes product images for landing page generation
// Returns: detailed product description, color palette, 3 scene prompts, template type

import { adjustForContrast, generateGradient } from './contrast';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const VISION_MODEL = 'google/gemini-2.0-flash-001';

export interface VisionAnalysis {
  dominantColors: string[];
  productType: string;
  productCategory?: string;
  productDescription?: string;
  visualAttributes: string[];
  productMood?: string;
  suggestedPalette: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  scenePrompt?: string;
  scenePrompts?: string[];
  templateType?: string;
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
                text: `You are a product photography expert. Analyze this product image for "${productName}".

TASK 1 — DESCRIBE THE PRODUCT:
Look carefully at the image. Describe EXACTLY what you see:
- What specific product is this? (e.g. "white leather running shoes with red accents and thick rubber sole", NOT just "shoes")
- What colors and materials can you identify? Be precise (e.g. "matte black plastic with brushed gold trim")
- What style/aesthetic? (sporty, luxury, casual, minimalist, etc.)
- Any visible brand elements, logos, patterns, or text?

TASK 2 — COLOR PALETTE:
Extract 3 dominant colors from the product. Then suggest a landing page palette:
- primary: a rich color from the product itself
- accent: a warm CTA-friendly color (orange, coral, or green work best)
- background: light neutral (#f5f5f5 to #ffffff)
- text: dark readable color

TASK 3 — 3 SCENE PROMPTS FOR AI IMAGE GENERATION:
Generate 3 prompts to place this product in different professional photography scenes.

CRITICAL: Each prompt MUST describe this specific product's appearance (colors, material, shape) so the AI generates a consistent product. Each scene must be COMPLETELY DIFFERENT from the others.

Scene 1 (HERO): This specific product elegantly displayed on a premium surface. Describe exact surface material (marble, wood, concrete, fabric), lighting setup (key light direction, fill, rim), and 1-2 complementary props. Clean composition.

Scene 2 (LIFESTYLE): This specific product in a real-world context where it would be used/worn/displayed. Describe the exact environment (gym, kitchen, bathroom, outdoor trail, office desk), natural lighting, and mood. Aspirational and warm.

Scene 3 (CREATIVE): An artistic close-up or dramatic angle of this product. Describe creative lighting (side light, backlight, spotlight), interesting composition, and minimal background with gradient or solid color.

ALL prompts must end with "professional commercial product photography, sharp focus, 4k, ultra detailed"

TASK 4 — TEMPLATE TYPE:
Pick ONE based on the product:
- "lifestyle-hero": beauty, fashion, skincare, food, home decor
- "editorial": luxury, jewelry, watches, accessories, perfume
- "product-spotlight": electronics, tech gadgets, sports equipment, tools

Return ONLY valid JSON:
{
  "productDescription": "2-3 detailed sentences describing exactly what you see in this image",
  "productType": "${productName}",
  "productCategory": "specific category (e.g. running shoes, face serum, wireless earbuds)",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "visualAttributes": ["4-5 adjectives: material, color, style, texture, aesthetic"],
  "productMood": "luxury | casual | professional | fun | natural",
  "suggestedPalette": {
    "primary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "templateType": "lifestyle-hero | editorial | product-spotlight",
  "scenePrompts": [
    "Full hero scene prompt with specific product description...",
    "Full lifestyle scene prompt with specific product description...",
    "Full creative scene prompt with specific product description..."
  ]
}`,
              },
            ],
          },
        ],
        max_tokens: 1200,
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

    // Ensure scenePrompts fallback (need 3 for poster tiles)
    if (!parsed.scenePrompts || parsed.scenePrompts.length < 3) {
      parsed.scenePrompts = getDefaultScenePrompts(productName, parsed.productDescription);
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

    return parsed;
  } catch (error) {
    console.error('Vision analysis error:', error);
    return null;
  }
}

/**
 * Enhanced vision analysis for marketing images — returns palette + scene prompt
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
  "productDescription": "2-3 sentences describing exactly what you see",
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

    return parsed;
  } catch (error) {
    console.error('Marketing vision analysis error:', error);
    return null;
  }
}

export function getDefaultScenePrompts(productName: string, productDescription?: string): string[] {
  const desc = productDescription || productName;
  return [
    `${desc} elegantly placed on polished white marble surface, soft diffused studio key light from upper left, clean minimal background, subtle shadow, professional commercial product photography, sharp focus, 4k, ultra detailed`,
    `${desc} in a stylish real-life setting with warm golden hour natural lighting, shallow depth of field, aspirational lifestyle context, blurred complementary background, professional commercial product photography, sharp focus, 4k, ultra detailed`,
    `artistic close-up of ${desc}, dramatic side lighting revealing texture and detail, soft gradient background, creative composition with negative space, professional commercial product photography, sharp focus, 4k, ultra detailed`,
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
