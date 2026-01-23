// R2 public URL helper
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-6f95df2287c74e40a3e0d525950d723c.r2.dev';

export function getR2PublicUrl(key: string): string {
  if (!key) return '';
  return `${R2_PUBLIC_URL}/${key}`;
}

export function getImageUrls(keys: string[] | undefined): string[] {
  if (!keys || keys.length === 0) return [];
  return keys.map(key => getR2PublicUrl(key));
}
