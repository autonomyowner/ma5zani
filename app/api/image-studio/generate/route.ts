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

async function fetchImageAsBase64DataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${btoa(binary)}`;
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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
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
    const imageDataUrl = await fetchImageAsBase64DataUrl(imageUrl);

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

    // Call OpenRouter with Nano Banana Pro (Gemini 3 Pro Image)
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.ma5zani.com',
        'X-Title': 'ma5zani Image Studio',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        modalities: ['text', 'image'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageDataUrl },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!orRes.ok) {
      const errorText = await orRes.text();
      console.error('OpenRouter error:', orRes.status, errorText);

      if (orRes.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a minute and try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `AI generation failed (${orRes.status})` },
        { status: 500 }
      );
    }

    const data = await orRes.json();

    // Extract image from OpenRouter response
    // OpenRouter returns images as data URLs in message content
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response:', JSON.stringify(data).substring(0, 500));
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    // Content can be a string or an array of parts
    let imageBase64 = '';

    if (typeof content === 'string') {
      // Try to find a data URL in the string
      const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match) {
        imageBase64 = match[1];
      }
    } else if (Array.isArray(content)) {
      // Find image_url part in content array
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const dataUrl = part.image_url.url;
          const match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
          if (match) {
            imageBase64 = match[1];
            break;
          }
        }
      }
    }

    if (!imageBase64) {
      console.error('No image found in response content:', JSON.stringify(content).substring(0, 500));
      return NextResponse.json({ error: 'No image in AI response' }, { status: 500 });
    }

    // Decode base64 to bytes for R2 upload
    const binaryString = atob(imageBase64);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to R2
    const imageR2Key = await uploadToR2(imageBytes, sellerId);

    return NextResponse.json({
      success: true,
      imageBase64: `data:image/png;base64,${imageBase64}`,
      imageKey: imageR2Key,
      imageUrl: getR2PublicUrl(imageR2Key),
    });
  } catch (error) {
    console.error('Image studio generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
