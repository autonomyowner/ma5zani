// AI Landing Page Generator - Orchestrator
// Runs vision + copywriting IN PARALLEL for speed

import { analyzeProductImage, VisionAnalysis } from './vision';
import { generateLandingPageCopy, ProductData, LandingPageCopy } from './copywriter';

export interface LandingPageGenerationResult {
  success: boolean;
  content?: LandingPageCopy;
  design?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  errors?: string[];
}

export interface GenerationInput {
  product: ProductData;
  imageUrl: string | null;
  storefrontColors: {
    primaryColor: string;
    accentColor: string;
  };
}

export async function generateLandingPage(
  input: GenerationInput
): Promise<LandingPageGenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      errors: ['AI service not configured. Please contact support.'],
    };
  }

  // Run vision + copywriting IN PARALLEL (don't wait for vision before copy)
  const [visionResult, copyResult] = await Promise.all([
    input.imageUrl
      ? analyzeProductImage(input.imageUrl, apiKey)
      : Promise.resolve(null),
    generateLandingPageCopy(input.product, null, apiKey),
  ]);

  if (!copyResult) {
    return {
      success: false,
      errors: ['Failed to generate landing page copy. Please try again.'],
    };
  }

  // Use vision colors if available, otherwise storefront colors
  const design = visionResult?.suggestedPalette
    ? {
        primaryColor: visionResult.suggestedPalette.primary,
        accentColor: visionResult.suggestedPalette.accent,
        backgroundColor: visionResult.suggestedPalette.background,
        textColor: visionResult.suggestedPalette.text,
      }
    : {
        primaryColor: input.storefrontColors.primaryColor,
        accentColor: input.storefrontColors.accentColor,
        backgroundColor: '#f9fafb',
        textColor: '#1a1a1a',
      };

  return {
    success: true,
    content: copyResult,
    design,
  };
}

export type { VisionAnalysis, ProductData, LandingPageCopy };
