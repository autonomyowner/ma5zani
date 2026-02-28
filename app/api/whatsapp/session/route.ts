import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

let _convex: import('convex/browser').ConvexHttpClient;
function getConvex() {
  if (!_convex) {
    const { ConvexHttpClient } = require('convex/browser');
    _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return _convex;
}

export async function POST(request: NextRequest) {
  try {
    const { sellerId, status, phoneNumber } = await request.json();

    await getConvex().mutation(api.whatsappSessions.upsertSession, {
      sellerId: sellerId as Id<'sellers'>,
      status,
      phoneNumber,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp session update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
