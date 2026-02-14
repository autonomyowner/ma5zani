// AI Landing Page Generator - Orchestrator
// Runs vision analysis + copywriting to generate landing page content

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

  // Step 1: Vision analysis (if image available)
  let visionAnalysis: VisionAnalysis | null = null;
  if (input.imageUrl) {
    visionAnalysis = await analyzeProductImage(input.imageUrl, apiKey);
  }

  // Step 2: Determine design colors
  const design = visionAnalysis?.suggestedPalette
    ? {
        primaryColor: visionAnalysis.suggestedPalette.primary,
        accentColor: visionAnalysis.suggestedPalette.accent,
        backgroundColor: visionAnalysis.suggestedPalette.background,
        textColor: visionAnalysis.suggestedPalette.text,
      }
    : {
        primaryColor: input.storefrontColors.primaryColor,
        accentColor: input.storefrontColors.accentColor,
        backgroundColor: '#f9fafb',
        textColor: '#1a1a1a',
      };

  // Step 3: Generate copy
  const copy = await generateLandingPageCopy(input.product, visionAnalysis, apiKey);

  if (!copy) {
    return {
      success: false,
      errors: ['Failed to generate landing page copy. Please try again.'],
    };
  }

  return {
    success: true,
    content: copy,
    design,
  };
}

export type { VisionAnalysis, ProductData, LandingPageCopy };
