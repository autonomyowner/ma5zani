import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { generateStorefrontConfig, GeneratedConfig } from '@/lib/storefront-ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, sellerId, previousConfig } = body;

    if (!prompt || !sellerId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and sellerId' },
        { status: 400 }
      );
    }

    // Fetch storefront data from Convex
    const [storefront, products, categories, seller] = await Promise.all([
      convex.query(api.storefronts.getStorefrontBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
      convex.query(api.products.getProductsBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
      convex.query(api.categories.getCategoriesBySeller, {
        sellerId: sellerId as Id<'sellers'>,
      }),
      convex.query(api.sellers.getSellerById, {
        sellerId: sellerId as Id<'sellers'>,
      }),
    ]);

    // Generate AI configuration
    const result = await generateStorefrontConfig(
      prompt,
      {
        storefront: storefront || null,
        products: products || [],
        categories: categories || [],
        seller: seller || null,
      },
      previousConfig as GeneratedConfig | undefined
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to generate design',
          details: result.errors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      config: result.config,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error('Storefront AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
