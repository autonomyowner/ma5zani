import { isAuthenticated } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

let cachedVoices: unknown = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return cached if fresh
    if (cachedVoices && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedVoices);
    }

    const res = await fetch('https://api.cartesia.ai/voices', {
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2024-06-10',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Cartesia voices error:', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: res.status }
      );
    }

    const voices = await res.json();
    cachedVoices = voices;
    cacheTimestamp = Date.now();

    return NextResponse.json(voices);
  } catch (error) {
    console.error('Voice list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
