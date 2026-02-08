import { NextRequest, NextResponse } from 'next/server';
import { sendConversionsEvent } from '@/lib/meta-conversions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, sourceUrl, userData, customData } = body;

    if (!eventName || !eventId) {
      return NextResponse.json({ error: 'Missing eventName or eventId' }, { status: 400 });
    }

    // Extract IP and user agent from request headers for better event matching
    const clientIpAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;
    const clientUserAgent = request.headers.get('user-agent') || undefined;

    const result = await sendConversionsEvent({
      eventName,
      eventId,
      sourceUrl: sourceUrl || request.headers.get('referer') || 'https://www.ma5zani.com',
      userData: {
        ...userData,
        clientIpAddress,
        clientUserAgent,
      },
      customData,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
