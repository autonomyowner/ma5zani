'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { sellerHasAccess } from '@/lib/sellerAccess';
import FounderOfferGate from '@/components/dashboard/FounderOfferGate';
import { getR2PublicUrl } from '@/lib/r2';
import FormatPicker from '@/components/marketing-image/FormatPicker';
import TemplatePicker from '@/components/marketing-image/TemplatePicker';
import ImagePreview from '@/components/marketing-image/ImagePreview';
import type { Id } from '@/convex/_generated/dataModel';

interface GenerationResult {
  productName: string;
  price: number;
  salePrice?: number;
  enhancedImageUrl: string;
  originalImageUrl: string;
  enhancedImageKey?: string;
  sceneImageUrl?: string;
  sceneImageKey?: string;
  palette: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  headline: string;
  subheadline: string;
  ctaText: string;
  productCategory?: string;
}

export default function MarketingImagesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const mi = (t as unknown as Record<string, Record<string, string>>).marketingImages;
  const seller = useQuery(api.sellers.getCurrentSellerProfile);
  const products = useQuery(api.products.getProducts);
  const storefront = useQuery(api.storefronts.getMyStorefront);
  const savedImages = useQuery(api.marketingImages.getMyMarketingImages);
  const saveImageMutation = useMutation(api.marketingImages.saveMarketingImage);
  const deleteImageMutation = useMutation(api.marketingImages.deleteMarketingImage);

  // Generator state
  const [mode, setMode] = useState<'gallery' | 'pick-product' | 'generating' | 'preview'>('gallery');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Preview state
  const [templateId, setTemplateId] = useState('lifestyle-hero');
  const [format, setFormat] = useState<'square' | 'story' | 'facebook'>('square');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');

  // Loading / auth gates
  if (seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (seller === null) {
    router.push('/onboarding');
    return null;
  }

  if (seller && !sellerHasAccess(seller)) {
    return (
      <DashboardLayout seller={seller} title={mi?.title || 'Marketing Images'}>
        <FounderOfferGate />
      </DashboardLayout>
    );
  }

  const storeName = storefront?.boutiqueName || seller.name;

  const handleGenerate = async () => {
    if (!selectedProductId) return;
    setError('');
    setGenerating(true);
    setMode('generating');

    try {
      const res = await fetch('/api/marketing-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller._id,
          productId: selectedProductId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed');
      }

      const data: GenerationResult = await res.json();
      setResult(data);
      setHeadline(data.headline);
      setSubheadline(data.subheadline);
      setCtaText(data.ctaText || 'اطلب دروك');
      setMode('preview');
    } catch (e) {
      setError(mi?.errorGeneration || 'Generation failed. Please try again.');
      setMode('pick-product');
      console.error(e);
    }
    setGenerating(false);
  };

  const handleSave = async (blob: Blob) => {
    if (!result) return;

    try {
      // Get presigned upload URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `marketing-${templateId}-${format}.png`,
          contentType: 'image/png',
          folder: 'images/marketing',
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await uploadRes.json();

      // Upload to R2
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: blob,
      });
      if (!putRes.ok) throw new Error('Upload failed');

      // Save record to Convex
      await saveImageMutation({
        productId: selectedProductId as Id<'products'>,
        templateId,
        format,
        imageKey: key,
        headline,
        subheadline,
      });

      // Return to gallery
      setMode('gallery');
      setResult(null);
    } catch (e) {
      console.error('Save failed:', e);
      setError(mi?.errorSave || 'Failed to save image');
    }
  };

  const handleDelete = async (id: Id<'marketingImages'>) => {
    if (!window.confirm(mi?.deleteConfirm || 'Delete this marketing image?')) return;
    try {
      await deleteImageMutation({ id });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // Products with images only
  const productsWithImages = products?.filter((p) => p.imageKeys && p.imageKeys.length > 0) || [];

  return (
    <DashboardLayout
      seller={seller}
      title={mi?.title || 'Marketing Images'}
      subtitle={mi?.subtitle || 'Generate professional product marketing images with AI'}
    >
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{mi?.totalImages || 'Total images'}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#0054A6]">{savedImages?.length ?? 0}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{mi?.productsAvailable || 'Products with images'}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#22B14C]">{productsWithImages.length}</p>
          </Card>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* ============ GENERATING SPINNER ============ */}
        {mode === 'generating' && (
          <Card className="p-8 lg:p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#0054A6] border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0054A6] mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
              {mi?.generating || 'AI is working...'}
            </h3>
            <p className="text-sm text-slate-500">{mi?.generatingDesc || 'Creating lifestyle scene, removing background, generating copy...'}</p>
          </Card>
        )}

        {/* ============ PRODUCT PICKER ============ */}
        {mode === 'pick-product' && (
          <Card className="p-4 lg:p-6">
            <h2
              className="text-base lg:text-lg font-bold text-[#0054A6] mb-4"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {mi?.pickProduct || 'Pick a product'}
            </h2>
            {productsWithImages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                {mi?.noProducts || 'No products with images found. Add images to your products first.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productsWithImages.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => setSelectedProductId(product._id)}
                    className={`rounded-xl border-2 overflow-hidden text-left transition-all ${
                      selectedProductId === product._id
                        ? 'border-[#0054A6] ring-2 ring-[#0054A6]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-square bg-slate-50 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getR2PublicUrl(product.imageKeys![0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs lg:text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.price} DA</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!selectedProductId || generating}
                className="flex-1"
              >
                {mi?.generate || 'Generate'}
              </Button>
              <Button variant="outline" onClick={() => { setMode('gallery'); setSelectedProductId(''); }}>
                {mi?.cancel || 'Cancel'}
              </Button>
            </div>
          </Card>
        )}

        {/* ============ PREVIEW ============ */}
        {mode === 'preview' && result && (
          <>
            {/* Template picker */}
            <Card className="p-4 lg:p-6">
              <h2
                className="text-base lg:text-lg font-bold text-[#0054A6] mb-3"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {mi?.pickTemplate || 'Pick a template'}
              </h2>
              <TemplatePicker value={templateId} onChange={setTemplateId} />
            </Card>

            {/* Format picker */}
            <Card className="p-4 lg:p-6">
              <h2
                className="text-base lg:text-lg font-bold text-[#0054A6] mb-3"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {mi?.pickFormat || 'Pick a format'}
              </h2>
              <FormatPicker value={format} onChange={setFormat} />
            </Card>

            {/* Edit text */}
            <Card className="p-4 lg:p-6">
              <h2
                className="text-base lg:text-lg font-bold text-[#0054A6] mb-3"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {mi?.editText || 'Edit text'}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {mi?.editHeadline || 'Headline'}
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm"
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {mi?.editSubheadline || 'Subheadline'}
                  </label>
                  <input
                    type="text"
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm"
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {mi?.editCta || 'Call to Action'}
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm"
                    dir="auto"
                  />
                </div>
              </div>
            </Card>

            {/* Image preview */}
            <Card className="p-4 lg:p-6">
              <h2
                className="text-base lg:text-lg font-bold text-[#0054A6] mb-4"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {mi?.preview || 'Preview'}
              </h2>
              <ImagePreview
                templateId={templateId}
                format={format}
                templateProps={{
                  productImageUrl: result.enhancedImageUrl || result.originalImageUrl,
                  sceneImageUrl: result.sceneImageUrl,
                  productName: result.productName,
                  price: result.price,
                  salePrice: result.salePrice,
                  headline,
                  subheadline,
                  ctaText,
                  palette: result.palette,
                  storeName,
                }}
                onSave={handleSave}
              />
            </Card>

            {/* Back button */}
            <div className="text-center">
              <Button variant="outline" onClick={() => { setMode('gallery'); setResult(null); }}>
                {mi?.backToGallery || 'Back to gallery'}
              </Button>
            </div>
          </>
        )}

        {/* ============ GALLERY ============ */}
        {mode === 'gallery' && (
          <>
            {/* Generate button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => { setMode('pick-product'); setError(''); }}
            >
              {mi?.generate || 'Generate Marketing Image'}
            </Button>

            {/* Saved images grid */}
            <Card className="p-4 lg:p-6">
              <h2
                className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {mi?.myImages || 'My Images'}
              </h2>

              {!savedImages || savedImages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  {mi?.noImages || 'No marketing images yet. Generate your first one!'}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedImages.map((img) => (
                    <div
                      key={img._id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square bg-slate-50 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getR2PublicUrl(img.imageKey)}
                          alt={img.headline || 'Marketing image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{img.format}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(img.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={getR2PublicUrl(img.imageKey)}
                            download
                            target="_blank"
                            className="text-xs text-[#0054A6] hover:underline"
                          >
                            {mi?.download || 'Download'}
                          </a>
                          <button
                            onClick={() => handleDelete(img._id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            {mi?.delete || 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
