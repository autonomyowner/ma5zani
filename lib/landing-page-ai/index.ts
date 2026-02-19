// AI Landing Page Generator - Orchestrator (v3)
// Phase 1: vision + copywriting + background removal IN PARALLEL
// Phase 2: scene generation (ControlNet) + R2 upload IN PARALLEL

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

  // ============ PHASE 1: Parallel AI tasks ============
  const [visionResult, copyResult, enhancedImageUrl] = await Promise.all([
    input.imageUrl
      ? analyzeProductImage(input.imageUrl, input.product.name, apiKey)
      : Promise.resolve(null),
    generateLandingPageCopy(input.product, input.sellerPrompt, null, apiKey),
    input.imageUrl
      ? removeBackground(input.imageUrl)
      : Promise.resolve(null),
  ]);

  if (!copyResult) {
    return {
      success: false,
      templateVersion: 3,
      errors: ['Failed to generate landing page copy. Please try again.'],
    };
  }

  // Determine template type from vision
  const templateType = visionResult?.templateType || 'lifestyle-hero';
  const isDarkTheme = templateType === 'product-spotlight';

  // ============ PHASE 2: Scene generation (depends on Phase 1 vision) ============
  let sceneImageUrls: (string | null)[] = [];

  if (input.imageUrl) {
    const scenePrompts = visionResult?.scenePrompts?.length === 3
      ? visionResult.scenePrompts
      : getDefaultScenePrompts(input.product.name);

    sceneImageUrls = await generateMultipleScenes(input.imageUrl, scenePrompts);
  }

  // ============ Build design palette ============
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
