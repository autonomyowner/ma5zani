import { NextRequest } from 'next/server';

/**
 * Image proxy — fetches R2 images through same-origin to avoid CORS issues.
 * Used by html-to-image capture which cannot handle cross-origin images.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Only allow R2 public URLs for security
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-6f95df2287c74e40a3e0d5259';
  if (!url.startsWith(R2_PUBLIC_URL) && !url.includes('.r2.dev/')) {
    return new Response('Invalid URL — only R2 images allowed', { status: 403 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new Response('Image fetch failed', { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('Content-Type') || 'image/png';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Proxy fetch failed', { status: 500 });
  }
}
