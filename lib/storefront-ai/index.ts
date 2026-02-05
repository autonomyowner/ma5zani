// AI Storefront Builder - Main Generator
// Uses OpenRouter API to generate storefront configurations

import { buildSystemPrompt, buildFollowUpPrompt, AIContext } from './prompts';
import { GeneratedConfig, StorefrontData, buildAIContext } from './context-builder';
import { validateConfig, validateArabicContent, ValidationResult } from './validator';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-sonnet'; // Better quality for creative design tasks

export interface GenerationResult {
  success: boolean;
  config?: GeneratedConfig;
  errors?: string[];
  warnings?: string[];
  rawResponse?: string;
}

export async function generateStorefrontConfig(
  prompt: string,
  storefrontData: StorefrontData,
  previousConfig?: GeneratedConfig
): Promise<GenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return {
      success: false,
      errors: ['AI service not configured. Please contact support.'],
    };
  }

  const context = buildAIContext(storefrontData);

  // Build the appropriate prompt
  let systemPrompt: string;
  let userPrompt: string;

  if (previousConfig) {
    // Follow-up request to modify existing config - use simpler system prompt
    systemPrompt = `You are an AI that modifies JSON configurations.
You will receive a current configuration and a user request.
Make ONLY the specific changes requested. Keep everything else exactly the same.
Return ONLY valid JSON - no explanations, no markdown.`;
    userPrompt = buildFollowUpPrompt(JSON.stringify(previousConfig, null, 2), prompt);
  } else {
    // New generation request
    systemPrompt = buildSystemPrompt(context);
    userPrompt = `Create a storefront design for: "${prompt}"

REQUIREMENTS:
1. Pick a BOLD aesthetic direction (not generic)
2. Use DISTINCTIVE fonts from the allowed list (never Inter/Roboto/Arial)
3. Apply DOMINANT + ACCENT color philosophy (not even splits)
4. Generate ALL text in both English AND Arabic
5. Features section: use BOLD TYPOGRAPHY (numbers like "24H", "100%", single words like "HERITAGE")
6. Include at least: hero, features, grid sections

Return ONLY valid JSON.`;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ma5zani.com',
        'X-Title': 'ma5zani Storefront AI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.8, // Higher for more creative designs
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return {
        success: false,
        errors: ['AI service error. Please try again.'],
      };
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content;

    if (!rawResponse) {
      return {
        success: false,
        errors: ['AI returned empty response. Please try again.'],
      };
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonString = extractJSON(rawResponse);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', rawResponse);
      return {
        success: false,
        errors: ['AI returned invalid format. Please try again.'],
        rawResponse,
      };
    }

    // Validate the configuration
    const validation = validateConfig(parsed);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        rawResponse,
      };
    }

    // Check Arabic content
    const arabicWarnings = validateArabicContent(validation.config!);

    return {
      success: true,
      config: validation.config,
      warnings: arabicWarnings.length > 0 ? arabicWarnings : undefined,
      rawResponse,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      errors: ['Failed to generate design. Please try again.'],
    };
  }
}

// Extract JSON from response (handles markdown code blocks)
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();

  // Handle ```json ... ``` blocks
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }

  // Handle leading/trailing non-JSON content
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

// Re-export types and utilities
export type { GeneratedConfig, StorefrontData, AIContext, ValidationResult };
export { buildAIContext } from './context-builder';
export { validateConfig, containsArabic } from './validator';
export { FONT_PAIRINGS, COLOR_PALETTES } from './prompts';

// Utility to get Google Fonts URL for a configuration
export function getGoogleFontsUrl(fonts: GeneratedConfig['fonts']): string {
  const fontFamilies = [
    fonts.display.replace(/ /g, '+'),
    fonts.body.replace(/ /g, '+'),
    fonts.arabic.replace(/ /g, '+'),
  ];

  // Remove duplicates
  const uniqueFonts = [...new Set(fontFamilies)];

  // Build URL with weights
  const families = uniqueFonts.map((font) => `family=${font}:wght@400;500;600;700`);

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
