import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { analyzeProductForMarketing } from '@/lib/landing-page-ai/vision';
import { generatePosterCopy } from '@/lib/marketing-image-ai';
import { removeBackground, generateLifestyleScene } from '@/lib/runware';
import { adjustForContrast, adjustForDarkTheme, generateGradient } from '@/lib/landing-page-ai/contrast';
import { getR2PublicUrl } from '@/lib/r2';
import { AwsClient } from 'aws4fetch';

let _convex: import('convex/browser').ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require('convex/browser');
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ma5zani';

const DARK_THEME_CATEGORIES = [
  'electronics', 'tech', 'phone', 'laptop', 'headphone', 'headphones',
  'speaker', 'gaming', 'sports', 'camera', 'earbuds', 'earphones',
  'smartwatch', 'tablet', 'console', 'keyboard', 'mouse', 'monitor',
];

async function uploadImageToR2(imageUrl: string, sellerId: string, prefix: string): Promise<string | null> {
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;

    const imageBuffer = await imageRes.arrayBuffer();
    const imageBody = new Uint8Array(imageBuffer);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const key = `images/${prefix}/${sellerId}/${timestamp}-${randomId}.png`;

    const r2 = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    });

    const uploadUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;

    const uploadRes = await r2.fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: imageBody,
    });

    if (!uploadRes.ok) {
      console.error(`R2 ${prefix} image upload failed:`, uploadRes.status);
      return null;
    }

    return key;
  } catch (err) {
    console.error(`Failed to upload ${prefix} image to R2:`, err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sellerId, productId } = body;

  if (!sellerId || !productId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Fetch product data
    const products = await getConvex().query(api.products.getProductsBySeller, {
      sellerId: sellerId as Id<'sellers'>,
    });

    const product = products?.find((p: { _id: string }) => p._id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imageUrl = product.imageKeys?.[0]
      ? getR2PublicUrl(product.imageKeys[0])
      : null;

    const apiKey = process.env.OPENROUTER_API_KEY;

    // === STEP 1 (parallel): Vision analysis + Background removal ===
    const [visionResult, enhancedImageUrl] = await Promise.all([
      imageUrl && apiKey
        ? analyzeProductForMarketing(imageUrl, product.name, apiKey)
        : Promise.resolve(null),
      imageUrl
        ? removeBackground(imageUrl)
        : Promise.resolve(null),
    ]);

    // Auto-detect dark theme from product category
    const categoryLower = (visionResult?.productCategory || '').toLowerCase();
    const isDarkTheme = DARK_THEME_CATEGORIES.some(cat => categoryLower.includes(cat));

    // === STEP 2 (parallel, AFTER step 1): Copy + Lifestyle scene ===
    const lifestylePrompt = visionResult?.lifestyleScenePrompt ||
      `${product.name} elegantly displayed on a premium surface, soft diffused studio lighting, clean professional background, professional commercial product photography, sharp focus, 4k, ultra detailed`;

    const [copyResult, sceneImageUrl] = await Promise.all([
      generatePosterCopy({
        productName: product.name,
        price: product.price,
        salePrice: product.salePrice,
        description: (product as any).description,
        visionData: visionResult ? {
          productDescription: visionResult.productDescription,
          visualAttributes: visionResult.visualAttributes,
          productCategory: visionResult.productCategory,
          suggestedFeatures: visionResult.suggestedFeatures,
        } : undefined,
      }),
      imageUrl
        ? generateLifestyleScene(imageUrl, lifestylePrompt, 0.55)
        : Promise.resolve(null),
    ]);

    // Build palette from vision or fallback
    let palette;
    if (visionResult?.suggestedPalette) {
      const baseAdjust = isDarkTheme
        ? adjustForDarkTheme({
            primaryColor: visionResult.suggestedPalette.primary,
            accentColor: visionResult.suggestedPalette.accent,
            backgroundColor: '#0a0a0a',
            textColor: '#f0f0f0',
          })
        : adjustForContrast({
            primaryColor: visionResult.suggestedPalette.primary,
            accentColor: visionResult.suggestedPalette.accent,
            backgroundColor: visionResult.suggestedPalette.background,
            textColor: visionResult.suggestedPalette.text,
          });
      const gradient = generateGradient(baseAdjust.primaryColor);
      palette = {
        primaryColor: baseAdjust.primaryColor,
        accentColor: baseAdjust.accentColor,
        backgroundColor: baseAdjust.backgroundColor,
        textColor: baseAdjust.textColor,
        gradientFrom: gradient.gradientFrom,
        gradientTo: gradient.gradientTo,
      };
    } else {
      palette = isDarkTheme
        ? {
            primaryColor: '#60a5fa',
            accentColor: '#F7941D',
            backgroundColor: '#0a0a0a',
            textColor: '#f0f0f0',
            gradientFrom: '#1a1a2e',
            gradientTo: '#0a0a0a',
          }
        : {
            primaryColor: '#0054A6',
            accentColor: '#F7941D',
            backgroundColor: '#f9fafb',
            textColor: '#1a1a1a',
            gradientFrom: '#0054A6',
            gradientTo: '#3d8ed7',
          };
    }

    // Upload enhanced and scene images to R2
    const [enhancedImageKey, sceneImageKey] = await Promise.all([
      enhancedImageUrl
        ? uploadImageToR2(enhancedImageUrl, sellerId, 'enhanced')
        : Promise.resolve(null),
      sceneImageUrl
        ? uploadImageToR2(sceneImageUrl, sellerId, 'scenes')
        : Promise.resolve(null),
    ]);

    const originalImageUrl = imageUrl || '';
    const enhancedUrl = enhancedImageKey ? getR2PublicUrl(enhancedImageKey) : null;
    const sceneUrl = sceneImageKey ? getR2PublicUrl(sceneImageKey) : null;

    // Build fallback copy if AI failed
    const copy = copyResult || {
      hookHeadline: product.name,
      subheadline: 'منتج بجودة عالية بسعر مناسب',
      problem: 'واش تدور على الجودة؟',
      solution: 'لقيت الحل هنا',
      features: ['جودة عالية مضمونة', 'تصميم عصري وأنيق', 'راحة كل يوم', 'يدوم معاك بزاف'],
      trustBadges: ['توصيل لكل 58 ولاية', 'الدفع عند الاستلام', 'ضمان الجودة'],
      ctaText: 'اطلب دروك',
    };

    return NextResponse.json({
      success: true,
      productName: product.name,
      price: product.price,
      salePrice: product.salePrice,
      enhancedImageUrl: enhancedUrl || originalImageUrl,
      originalImageUrl,
      enhancedImageKey,
      sceneImageUrl: sceneUrl,
      sceneImageKey,
      palette,
      copy,
      isDarkTheme,
      productCategory: visionResult?.productCategory || '',
    });
  } catch (error) {
    console.error('Marketing image generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
