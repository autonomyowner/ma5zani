import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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

const STYLE_PROMPTS: Record<string, string> = {
  professional:
    'Place this product on a clean, minimalist surface with soft studio lighting. Professional e-commerce product photography style. White or light gradient background, subtle shadow, crisp details, high-end commercial look. No text or watermarks.',
  lifestyle:
    'Place this product in a natural lifestyle scene that matches what it is. Beautiful ambient lighting, shallow depth of field, aspirational setting. The product should be the hero but feel naturally placed. Professional advertising photography. No text or watermarks.',
  promo:
    'Create a bold, eye-catching promotional sale image for this product. Vibrant colors, dynamic composition, the product prominently displayed. Add visual elements suggesting a special offer or discount (like ribbons, badges, or burst shapes). Professional retail advertising style. No text or watermarks.',
  social:
    'Create a scroll-stopping social media ad image for this product. Bold, vibrant, high-contrast composition optimized for mobile screens. Modern, trendy aesthetic. The product should pop against an attention-grabbing background. Professional paid advertising style. No text or watermarks.',
};

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 628 },
};

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Workers-safe base64 encoding (chunked to avoid stack overflow)
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

async function uploadToR2(imageBytes: Uint8Array, sellerId: string): Promise<string> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const key = `images/studio/${sellerId}/${timestamp}-${randomId}.png`;

  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  });

  const uploadUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;

  const uploadRes = await r2.fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: imageBytes as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    throw new Error(`R2 upload failed: ${uploadRes.status}`);
  }

  return key;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sellerId, productId, style, format, storeName } = body;

  if (!sellerId || !productId || !style || !format) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    // Fetch product
    const products = await getConvex().query(api.products.getProductsBySeller, {
      sellerId: sellerId as Id<'sellers'>,
    });
    const product = products?.find((p: { _id: string }) => p._id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imageKey = product.imageKeys?.[0];
    if (!imageKey) {
      return NextResponse.json({ error: 'Product has no images' }, { status: 400 });
    }

    const imageUrl = getR2PublicUrl(imageKey);
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    // Build prompt
    const dims = FORMAT_DIMENSIONS[format] || FORMAT_DIMENSIONS.square;
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.professional;

    const prompt = [
      `Generate a professional marketing image for this product.`,
      `Product: ${product.name}`,
      storeName ? `Brand/Store: ${storeName}` : '',
      `Price: ${product.price.toLocaleString()} DZD`,
      product.salePrice ? `Sale Price: ${product.salePrice.toLocaleString()} DZD` : '',
      ``,
      `Style instructions: ${stylePrompt}`,
      ``,
      `Output dimensions: ${dims.width}x${dims.height} pixels.`,
      `The product in the reference image must be clearly recognizable in the output.`,
      `Output a single high-quality image.`,
    ]
      .filter(Boolean)
      .join('\n');

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errorText);
      return NextResponse.json(
        { error: `AI generation failed (${geminiRes.status})` },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();

    // Extract generated image from response
    const candidates = geminiData.candidates;
    if (!candidates?.[0]?.content?.parts) {
      console.error('Unexpected Gemini response:', JSON.stringify(geminiData).substring(0, 500));
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    const imagePart = candidates[0].content.parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: 'No image in AI response' }, { status: 500 });
    }

    const generatedBase64 = imagePart.inlineData.data;

    // Decode base64 to bytes for R2 upload
    const binaryString = atob(generatedBase64);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to R2
    const imageR2Key = await uploadToR2(imageBytes, sellerId);

    return NextResponse.json({
      success: true,
      imageBase64: `data:image/png;base64,${generatedBase64}`,
      imageKey: imageR2Key,
      imageUrl: getR2PublicUrl(imageR2Key),
    });
  } catch (error) {
    console.error('Image studio generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
