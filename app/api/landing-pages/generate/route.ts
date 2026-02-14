import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateLandingPage } from '@/lib/landing-page-ai';
import { getR2PublicUrl } from '@/lib/r2';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, productId, storefrontId, landingPageId } = body;

    if (!sellerId || !productId || !storefrontId || !landingPageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch product and storefront data
    const [storefront, product] = await Promise.all([
      convex.query(api.storefronts.getStorefrontBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
      convex.query(api.publicOrders.getPublicProduct, {
        slug: '', // We'll get product directly
        productId: productId as Id<'products'>,
      }),
    ]);

    // Get product directly if public query didn't work
    const products = await convex.query(api.products.getProductsBySeller, {
      sellerId: sellerId as Id<'sellers'>,
    });
    const productData = products?.find((p: { _id: string }) => p._id === productId);

    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!storefront) {
      return NextResponse.json(
        { error: 'Storefront not found' },
        { status: 404 }
      );
    }

    // Get product image URL
    const imageUrl = productData.imageKeys?.[0]
      ? getR2PublicUrl(productData.imageKeys[0])
      : null;

    // Run AI generation
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
      storefrontColors: {
        primaryColor: storefront.theme.primaryColor,
        accentColor: storefront.theme.accentColor,
      },
    });

    if (!result.success || !result.content || !result.design) {
      return NextResponse.json(
        { error: result.errors?.[0] || 'AI generation failed' },
        { status: 422 }
      );
    }

    // Update the landing page record with AI content
    await convex.mutation(api.landingPages.updateLandingPageContent, {
      id: landingPageId as Id<'landingPages'>,
      content: {
        headline: result.content.headline,
        subheadline: result.content.subheadline,
        featureBullets: result.content.featureBullets.slice(0, 4),
        ctaText: result.content.ctaText,
        urgencyText: result.content.urgencyText || undefined,
        productDescription: result.content.productDescription,
        socialProof: result.content.socialProof || undefined,
      },
      design: result.design,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      design: result.design,
    });
  } catch (error) {
    console.error('Landing page generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
