// AI Landing Page Generator - Orchestrator (v3)
// 2-phase pipeline:
//   Phase 1: Vision analysis + Background removal (parallel)
//   Phase 2: Copywriting (with vision data) + Scene generation (parallel)
// This ensures copy is product-aware and scenes match what vision sees.

import { analyzeProductImage, VisionAnalysis, getDefaultScenePrompts } from './vision';
import { generateLandingPageCopy, ProductData, LandingPageCopy } from './copywriter';
import { removeBackground, generateMultipleScenes } from '../runware';
import { adjustForContrast, adjustForDarkTheme, generateGradient, validatePalette } from './contrast';

export interface LandingPageGenerationResult {
  success: boolean;
  content?: LandingPageCopy;
  design?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    gradientFrom?: string;
    gradientTo?: string;
    contrastValidated?: boolean;
    isDarkTheme?: boolean;
  };
  enhancedImageUrl?: string;
  sceneImageUrls?: string[];
  templateType?: string;
  templateVersion: number;
  errors?: string[];
}

export interface GenerationInput {
  product: ProductData;
  imageUrl: string | null;
  sellerPrompt: string;
  sellerId: string;
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
      templateVersion: 3,
      errors: ['AI service not configured. Please contact support.'],
    };
  }

  // ============ PHASE 1: Vision + BG removal in parallel ============
  // Vision must complete before Phase 2 because:
  //   - Copywriter needs vision data for accurate product descriptions
  //   - Scene prompts come from vision (specific to what Gemini sees)
  console.log('LP v3: Phase 1 — Starting vision analysis + bg removal');

  const [visionResult, enhancedImageUrl] = await Promise.all([
    input.imageUrl
      ? analyzeProductImage(input.imageUrl, input.product.name, apiKey)
      : Promise.resolve(null),
    input.imageUrl
      ? removeBackground(input.imageUrl)
      : Promise.resolve(null),
  ]);

  if (visionResult?.productDescription) {
    console.log('LP v3: Vision returned product description:', visionResult.productDescription.slice(0, 100));
  } else {
    console.log('LP v3: Vision returned no product description');
  }

  // ============ PHASE 2: Copy + Scenes in parallel ============
  // Copy gets vision analysis for accurate product-aware descriptions
  // Scenes use vision's specific prompts (or defaults if vision failed)
  console.log('LP v3: Phase 2 — Starting copywriting (with vision) + scene generation');

  const scenePrompts = visionResult?.scenePrompts?.length === 3
    ? visionResult.scenePrompts
    : getDefaultScenePrompts(input.product.name, visionResult?.productDescription || undefined);

  console.log('LP v3: Scene prompts:', scenePrompts.map(p => p.slice(0, 80) + '...'));

  const [copyResult, sceneImageUrls] = await Promise.all([
    generateLandingPageCopy(input.product, input.sellerPrompt, visionResult, apiKey),
    input.imageUrl
      ? generateMultipleScenes(input.imageUrl, scenePrompts)
      : Promise.resolve([] as (string | null)[]),
  ]);

  const sceneSuccessCount = sceneImageUrls.filter(u => u !== null).length;
  console.log(`LP v3: Phase 2 complete — copy: ${copyResult ? 'OK' : 'FAILED'}, scenes: ${sceneSuccessCount}/${scenePrompts.length}`);

  if (!copyResult) {
    return {
      success: false,
      templateVersion: 3,
      errors: ['Failed to generate landing page copy. Please try again.'],
    };
  }

  // ============ Build design palette ============
  const templateType = visionResult?.templateType || 'lifestyle-hero';
  const isDarkTheme = templateType === 'product-spotlight';

  let design: LandingPageGenerationResult['design'];

  if (visionResult?.suggestedPalette) {
    let palette = {
      primaryColor: visionResult.suggestedPalette.primary,
      accentColor: visionResult.suggestedPalette.accent,
      backgroundColor: isDarkTheme ? '#0a0a0a' : visionResult.suggestedPalette.background,
      textColor: isDarkTheme ? '#f0f0f0' : visionResult.suggestedPalette.text,
    };

    // Apply appropriate contrast adjustment
    const validation = validatePalette(palette);
    if (!(validation.textPasses && validation.accentPasses && validation.primaryPasses)) {
      palette = isDarkTheme ? adjustForDarkTheme(palette) : adjustForContrast(palette);
    }

    const gradient = generateGradient(palette.primaryColor);

    design = {
      ...palette,
      gradientFrom: gradient.gradientFrom,
      gradientTo: gradient.gradientTo,
      contrastValidated: true,
      isDarkTheme,
    };
  } else {
    // Storefront colors fallback
    const fallback = {
      primaryColor: input.storefrontColors.primaryColor,
      accentColor: input.storefrontColors.accentColor,
      backgroundColor: isDarkTheme ? '#0a0a0a' : '#f9fafb',
      textColor: isDarkTheme ? '#f0f0f0' : '#1a1a1a',
    };

    const adjusted = isDarkTheme ? adjustForDarkTheme(fallback) : adjustForContrast(fallback);
    const gradient = generateGradient(adjusted.primaryColor);

    design = {
      ...adjusted,
      gradientFrom: gradient.gradientFrom,
      gradientTo: gradient.gradientTo,
      contrastValidated: true,
      isDarkTheme,
    };
  }

  // Filter out failed scene generations
  const successfulSceneUrls = sceneImageUrls.filter((url): url is string => url !== null);

  return {
    success: true,
    content: copyResult,
    design,
    enhancedImageUrl: enhancedImageUrl || undefined,
    sceneImageUrls: successfulSceneUrls.length > 0 ? successfulSceneUrls : undefined,
    templateType,
    templateVersion: 3,
  };
}

export type { VisionAnalysis, ProductData, LandingPageCopy };
