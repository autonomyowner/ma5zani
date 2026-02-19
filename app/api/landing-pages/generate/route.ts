import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateLandingPage } from '@/lib/landing-page-ai';
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

/**
 * Upload an image from a temporary URL to R2.
 * Returns the R2 key on success, null on failure.
 */
async function uploadImageToR2(imageUrl: string, keyPrefix: string, sellerId: string): Promise<string | null> {
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;

    const imageBuffer = await imageRes.arrayBuffer();
    const imageBody = new Uint8Array(imageBuffer);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const key = `${keyPrefix}/${sellerId}/${timestamp}-${randomId}.png`;

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
      console.error('R2 image upload failed:', uploadRes.status);
      return null;
    }

    return key;
  } catch (err) {
    console.error('Failed to upload image to R2:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sellerId, productId, storefrontId, landingPageId, prompt } = body;

  if (!sellerId || !productId || !storefrontId || !landingPageId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Fetch product + storefront in parallel (single query each)
    const [storefront, products] = await Promise.all([
      getConvex().query(api.storefronts.getStorefrontBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
      getConvex().query(api.products.getProductsBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
    ]);

    const productData = products?.find((p: { _id: string }) => p._id === productId);

    if (!productData || !storefront) {
      return NextResponse.json({ error: 'Product or storefront not found' }, { status: 404 });
    }

    // Get product image URL
    const imageUrl = productData.imageKeys?.[0]
      ? getR2PublicUrl(productData.imageKeys[0])
      : null;

    // Run AI generation (2-phase pipeline: vision+copy+bg removal → scene generation)
    const result = await generateLandingPage({
      product: {
        name: productData.name,
        price: productData.price,
        salePrice: productData.salePrice,
        description: productData.description,
        sizes: productData.sizes,
        colors: productData.colors,
      },
      imageUrl,
      sellerPrompt: prompt || '',
      sellerId,
      storefrontColors: {
        primaryColor: storefront.theme.primaryColor,
        accentColor: storefront.theme.accentColor,
      },
    });

    if (!result.success || !result.content || !result.design) {
      // Reset LP status so it doesn't stay stuck
      await getConvex().mutation(api.landingPages.updateLandingPageStatus, {
        id: landingPageId as Id<'landingPages'>,
        status: 'archived',
      });
      return NextResponse.json(
        { error: result.errors?.[0] || 'AI generation failed' },
        { status: 422 }
      );
    }

    // Upload enhanced image + scene images to R2 in parallel
    const uploadTasks: Promise<string | null>[] = [];

    // Enhanced (bg-removed) image
    if (result.enhancedImageUrl) {
      uploadTasks.push(uploadImageToR2(result.enhancedImageUrl, 'images/enhanced', sellerId));
    }

    // Scene images
    const sceneUploadStartIndex = uploadTasks.length;
    if (result.sceneImageUrls) {
      for (const sceneUrl of result.sceneImageUrls) {
        uploadTasks.push(uploadImageToR2(sceneUrl, 'images/scenes', sellerId));
      }
    }

    const uploadResults = await Promise.all(uploadTasks);

    // Extract keys
    let enhancedImageKeys: string[] | undefined;
    if (result.enhancedImageUrl && uploadResults[0]) {
      enhancedImageKeys = [uploadResults[0]];
    }

    let sceneImageKeys: string[] | undefined;
    if (result.sceneImageUrls) {
      const sceneKeys = uploadResults
        .slice(sceneUploadStartIndex)
        .filter((key): key is string => key !== null);
      if (sceneKeys.length > 0) {
        sceneImageKeys = sceneKeys;
      }
    }

    // Update the landing page record with AI content + enhanced data
    await getConvex().mutation(api.landingPages.updateLandingPageContent, {
      id: landingPageId as Id<'landingPages'>,
      content: {
        headline: result.content.headline,
        subheadline: result.content.subheadline,
        featureBullets: result.content.featureBullets.slice(0, 4),
        ctaText: result.content.ctaText,
        urgencyText: result.content.urgencyText || undefined,
        productDescription: result.content.productDescription,
        socialProof: result.content.socialProof || undefined,
        // v3 fields
        guaranteeText: result.content.guaranteeText || undefined,
        secondaryCta: result.content.secondaryCta || undefined,
        scarcityText: result.content.scarcityText || undefined,
        microCopy: result.content.microCopy || undefined,
      },
      design: result.design,
      enhancedImageKeys,
      sceneImageKeys,
      templateVersion: result.templateVersion,
      templateType: result.templateType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Landing page generation error:', error);

    // Clean up stuck record on any error
    try {
      await getConvex().mutation(api.landingPages.updateLandingPageStatus, {
        id: landingPageId as Id<'landingPages'>,
        status: 'archived',
      });
    } catch { /* ignore cleanup errors */ }

    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
