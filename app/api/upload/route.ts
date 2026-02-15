import { AwsClient } from 'aws4fetch';
import { isAuthenticated } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ma5zani';

export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType, folder = 'images' } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    // Generate unique key with folder structure
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = filename.split('.').pop() || 'jpg';
    const key = `${folder}/${timestamp}-${randomId}.${extension}`;

    const r2 = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    });

    const url = new URL(
      `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`
    );
    url.searchParams.set('X-Amz-Expires', '3600');

    const signed = await r2.sign(
      new Request(url.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
      }),
      { aws: { signQuery: true } }
    );

    return NextResponse.json({
      uploadUrl: signed.url,
      key,
      publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
