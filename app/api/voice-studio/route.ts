import { isAuthenticated } from '@/lib/auth-server';
import { NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ma5zani';
const MAX_TRANSCRIPT_LENGTH = 5000;

export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, voiceId, language, speed } = await request.json();

    if (!transcript || !voiceId) {
      return NextResponse.json(
        { error: 'Missing transcript or voiceId' },
        { status: 400 }
      );
    }

    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        { error: `Transcript exceeds ${MAX_TRANSCRIPT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Map language to Cartesia language code
    const langMap: Record<string, string> = {
      ar: 'ar',
      en: 'en',
      fr: 'fr',
    };
    const cartesiaLang = langMap[language] || 'en';

    // Call Cartesia TTS API
    const ttsRes = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2025-04-16',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-3',
        transcript,
        voice: { mode: 'id', id: voiceId },
        language: cartesiaLang,
        output_format: {
          container: 'mp3',
          bit_rate: 128000,
          sample_rate: 44100,
        },
        ...(speed && speed !== 1 ? {
          generation_config: {
            speed: speed,
          },
        } : {}),
      }),
    });

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      console.error('Cartesia TTS error:', ttsRes.status, errorText);
      return NextResponse.json(
        { error: 'TTS generation failed' },
        { status: ttsRes.status }
      );
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    // Upload to R2
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const key = `audio/${timestamp}-${randomId}.mp3`;

    const r2 = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    });

    const r2Url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;

    await r2.fetch(r2Url, {
      method: 'PUT',
      headers: { 'Content-Type': 'audio/mpeg' },
      body: new Uint8Array(audioBuffer),
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    console.error('Voice studio error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
