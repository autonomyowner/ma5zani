import { AwsClient } from 'aws4fetch';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ma5zani';

export async function uploadBufferToR2(
  buffer: Buffer,
  contentType: string,
  sellerId: string
): Promise<string> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const key = `images/telegram/${sellerId}/${timestamp}-${randomId}.${extension}`;

  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  });

  const url = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;

  await r2.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: new Uint8Array(buffer),
  });

  return key;
}
