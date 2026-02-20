import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { analyzeProductForMarketing } from '@/lib/landing-page-ai/vision';
import { generateMarketingCopy } from '@/lib/marketing-image-ai';
import { removeBackground, generateStudioBackground } from '@/lib/runware';
import { adjustForContrast, generateGradient } from '@/lib/landing-page-ai/contrast';
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

    // Phase 1: Run vision + copy + bg removal in parallel
    const [visionResult, copyResult, enhancedImageUrl] = await Promise.all([
      imageUrl && apiKey
        ? analyzeProductForMarketing(imageUrl, product.name, apiKey)
        : Promise.resolve(null),
      generateMarketingCopy(
        product.name,
        product.price,
        product.salePrice,
        product.description,
      ),
      imageUrl
        ? removeBackground(imageUrl)
        : Promise.resolve(null),
    ]);

    // Phase 2: Generate studio background using text-to-image (no seed image)
    // The product photo stays untouched — only the background environment is AI-generated
    const backgroundPrompt = visionResult?.scenePrompt ||
      `clean white marble surface with subtle grey veining, soft diffused studio lighting from upper left, gentle shadow gradients, blurred light grey studio backdrop, warm neutral color temperature, professional commercial studio photography, empty product display surface, centered composition, soft natural shadows, shallow depth of field, 8k ultra detailed`;

    const sceneGeneration = generateStudioBackground(backgroundPrompt);

    // Build palette from vision or fallback
    let palette;
    if (visionResult?.suggestedPalette) {
      const adjusted = adjustForContrast({
        primaryColor: visionResult.suggestedPalette.primary,
        accentColor: visionResult.suggestedPalette.accent,
        backgroundColor: visionResult.suggestedPalette.background,
        textColor: visionResult.suggestedPalette.text,
      });
      const gradient = generateGradient(adjusted.primaryColor);
      palette = {
        primaryColor: adjusted.primaryColor,
        accentColor: adjusted.accentColor,
        backgroundColor: adjusted.backgroundColor,
        textColor: adjusted.textColor,
        gradientFrom: gradient.gradientFrom,
        gradientTo: gradient.gradientTo,
      };
    } else {
      palette = {
        primaryColor: '#0054A6',
        accentColor: '#F7941D',
        backgroundColor: '#f9fafb',
        textColor: '#1a1a1a',
        gradientFrom: '#0054A6',
        gradientTo: '#3d8ed7',
      };
    }

    // Wait for scene generation + upload enhanced and scene images to R2
    const sceneImageUrl = await sceneGeneration;

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
      headline: copyResult?.headline || product.name,
      subheadline: copyResult?.subheadline || '',
      ctaText: copyResult?.ctaText || 'اطلب دروك',
      productCategory: visionResult?.productCategory || '',
    });
  } catch (error) {
    console.error('Marketing image generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
