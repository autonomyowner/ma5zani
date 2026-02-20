'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { MARKETING_TEMPLATES, FORMAT_DIMENSIONS, type MarketingTemplateProps } from './templates';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/lib/LanguageContext';

interface ImagePreviewProps {
  templateId: string;
  format: 'square' | 'story' | 'facebook';
  templateProps: Omit<MarketingTemplateProps, 'format'>;
  onSave: (blob: Blob) => Promise<void>;
}

/**
 * Convert an external image URL to a base64 data URL via same-origin proxy.
 * Direct cross-origin fetch fails in the browser due to CORS — the proxy
 * endpoint (/api/image-proxy) fetches server-side and returns the bytes.
 */
async function imageToBase64(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('imageToBase64 failed:', e);
    return url; // Fallback to original URL (capture may fail)
  }
}

export default function ImagePreview({ templateId, format, templateProps, onSave }: ImagePreviewProps) {
  const { t } = useLanguage();
  const mi = (t as unknown as Record<string, Record<string, string>>).marketingImages;
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [base64ProductImage, setBase64ProductImage] = useState<string>('');
  const [base64SceneImage, setBase64SceneImage] = useState<string>('');
  const [imageReady, setImageReady] = useState(false);

  // Pre-convert both product and scene images to base64 via proxy
  useEffect(() => {
    setImageReady(false);
    const conversions: Promise<void>[] = [];

    if (templateProps.productImageUrl) {
      conversions.push(
        imageToBase64(templateProps.productImageUrl).then((b64) => setBase64ProductImage(b64))
      );
    }
    if (templateProps.sceneImageUrl) {
      conversions.push(
        imageToBase64(templateProps.sceneImageUrl).then((b64) => setBase64SceneImage(b64))
      );
    }

    if (conversions.length > 0) {
      Promise.all(conversions).then(() => setImageReady(true));
    } else {
      setImageReady(true);
    }
  }, [templateProps.productImageUrl, templateProps.sceneImageUrl]);

  const template = MARKETING_TEMPLATES.find((tmpl) => tmpl.id === templateId);
  if (!template) return null;

  const dim = FORMAT_DIMENSIONS[format];
  const TemplateComponent = template.component;

  // Both preview and capture use base64 to ensure consistency
  const props: MarketingTemplateProps = {
    ...templateProps,
    format,
    productImageUrl: base64ProductImage || templateProps.productImageUrl,
    sceneImageUrl: base64SceneImage || templateProps.sceneImageUrl,
  };

  // Scale down the preview to fit the viewport
  const maxPreviewWidth = 480;
  const maxPreviewHeight = 560;
  const scaleX = maxPreviewWidth / dim.width;
  const scaleY = maxPreviewHeight / dim.height;
  const scale = Math.min(scaleX, scaleY, 1);

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!captureRef.current) return null;
    try {
      const dataUrl = await toPng(captureRef.current, {
        width: dim.width,
        height: dim.height,
        pixelRatio: 1,
        cacheBust: true,
        skipAutoScale: true,
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (err) {
      console.error('Image capture error:', err);
      return null;
    }
  }, [dim]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await captureImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateProps.productName}-${format}-${templateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [captureImage, templateProps.productName, format, templateId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const blob = await captureImage();
      if (!blob) return;
      await onSave(blob);
    } finally {
      setSaving(false);
    }
  }, [captureImage, onSave]);

  return (
    <div>
      {/* Visible scaled preview */}
      <div
        className="mx-auto rounded-xl overflow-hidden border border-slate-200"
        style={{
          width: dim.width * scale,
          height: dim.height * scale,
        }}
      >
        <div
          style={{
            width: dim.width,
            height: dim.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplateComponent {...props} />
        </div>
      </div>

      {/* Offscreen full-res capture container — must be rendered (not opacity:0) for html-to-image */}
      <div
        style={{
          position: 'fixed',
          left: -99999,
          top: 0,
          width: dim.width,
          height: dim.height,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={captureRef}
          style={{
            width: dim.width,
            height: dim.height,
          }}
        >
          <TemplateComponent {...props} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4 justify-center">
        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={downloading || !imageReady}
        >
          {downloading ? (mi?.downloading || 'Downloading...') : (mi?.download || 'Download')}
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saving || !imageReady}
        >
          {saving ? (mi?.saving || 'Saving...') : (mi?.save || 'Save')}
        </Button>
      </div>
    </div>
  );
}
