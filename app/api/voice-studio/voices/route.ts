import { isAuthenticated } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

let cachedVoices: unknown[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchAllVoices(): Promise<unknown[]> {
  const allVoices: unknown[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < 10; page++) {
    const url = new URL('https://api.cartesia.ai/voices');
    if (startingAfter) {
      url.searchParams.set('starting_after', startingAfter);
    }

    const res = await fetch(url.toString(), {
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2025-04-16',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Cartesia voices error:', res.status, text);
      break;
    }

    const body = await res.json();
    const voices = body.data || body;

    if (Array.isArray(voices)) {
      allVoices.push(...voices);
    }

    if (!body.has_more || !body.next_page) break;
    startingAfter = body.next_page;
  }

  return allVoices;
}

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return cached if fresh
    if (cachedVoices.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedVoices);
    }

    const voices = await fetchAllVoices();
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
