'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { sellerHasAccess } from '@/lib/sellerAccess';
import FounderOfferGate from '@/components/dashboard/FounderOfferGate';
import ImagePreview from '@/components/marketing-image/ImagePreview';
import { POSTER_TEMPLATES, type PosterCopy, type PosterTemplateProps } from '@/components/marketing-image/templates';
import { getR2PublicUrl } from '@/lib/r2';
import { localText } from '@/lib/translations';

interface GenerationResult {
  productName: string;
  price: number;
  salePrice?: number;
  enhancedImageUrl: string;
  originalImageUrl: string;
  enhancedImageKey?: string;
  sceneImageUrl?: string;
  sceneImageKey?: string;
  palette: PosterTemplateProps['palette'];
  copy: PosterCopy;
  isDarkTheme: boolean;
  productCategory: string;
  productId: string;
}

export default function MarketingImagesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const mi = (t as unknown as Record<string, Record<string, string>>).marketingImages;

  const seller = useQuery(api.sellers.getCurrentSellerProfile);
  const storefront = useQuery(api.storefronts.getMyStorefront);
  const savedImages = useQuery(api.marketingImages.getMyMarketingImages);

  const saveImageMutation = useMutation(api.marketingImages.saveMarketingImage);
  const deleteImageMutation = useMutation(api.marketingImages.deleteMarketingImage);

  const [showPicker, setShowPicker] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('poster-light');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Loading state
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

  // Activation gate
  if (!sellerHasAccess(seller)) {
    return (
      <DashboardLayout seller={seller} title={mi?.title || 'Marketing Images'}>
        <FounderOfferGate />
      </DashboardLayout>
    );
  }

  const storeName = storefront?.boutiqueName || seller.name || 'Ma5zani Store';

  const handleProductSelect = async (product: Doc<'products'>) => {
    setShowPicker(false);
    setError('');
    setResult(null);
    setGenerating(true);
    setSavedSuccess(false);

    setGeneratingStep(mi?.generatingAnalyzing || 'Analyzing product...');

    try {
      const res = await fetch('/api/marketing-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller!._id,
          productId: product._id,
        }),
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult({
        ...data,
        productId: product._id,
      });

      // Auto-select template based on dark theme detection
      setSelectedTemplateId(data.isDarkTheme ? 'poster-dark' : 'poster-light');
    } catch (err) {
      console.error('Generation error:', err);
      setError(mi?.errorGeneration || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingStep('');
    }
  };

  const handleSaveImage = async (blob: Blob) => {
    if (!result || !seller) return;

    try {
      // Step 1: Get presigned URL from upload API
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `poster-${Date.now()}.png`,
          contentType: 'image/png',
          folder: `images/marketing/${seller._id}`,
        }),
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await presignRes.json();

      // Step 2: Upload PNG to R2 via presigned URL
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/png' },
      });
      if (!putRes.ok) throw new Error('Upload to R2 failed');

      // Step 3: Save reference in Convex
      await saveImageMutation({
        productId: result.productId as any,
        templateId: selectedTemplateId,
        format: 'story',
        imageKey: key,
        headline: result.copy.hookHeadline,
        subheadline: result.copy.subheadline,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(mi?.errorSave || 'Failed to save image');
    }
  };

  const handleDeleteImage = async (id: any) => {
    if (!confirm(mi?.deleteConfirm || 'Delete this marketing image?')) return;
    try {
      await deleteImageMutation({ id });
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const templateProps: PosterTemplateProps | null = result
    ? {
        productImageUrl: result.enhancedImageUrl,
        sceneImageUrl: result.sceneImageUrl,
        productName: result.productName,
        price: result.price,
        salePrice: result.salePrice,
        copy: result.copy,
        palette: result.palette,
        storeName,
        isDarkTheme: result.isDarkTheme,
      }
    : null;

  return (
    <DashboardLayout seller={seller} title={mi?.title || 'Marketing Images'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {mi?.title || 'Marketing Images'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mi?.subtitle || 'Generate professional product marketing images with AI'}
            </p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            disabled={generating}
            className="px-6 py-2.5 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors disabled:opacity-50"
          >
            {mi?.generatePoster || mi?.generate || 'Generate Poster'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
            <button onClick={() => setError('')} className="float-left text-red-400 hover:text-red-600 mr-2">✕</button>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div className="mb-8 p-8 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0054A6]/10 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-[#0054A6]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-2">
              {mi?.generating || 'AI is working...'}
            </p>
            <p className="text-sm text-slate-500">{generatingStep}</p>
            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#0054A6] animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Result preview */}
        {result && templateProps && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200">
            {/* Template switcher */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {POSTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-[#0054A6] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tmpl.name[language] || tmpl.name.en}
                </button>
              ))}
            </div>

            {/* Preview + actions */}
            <ImagePreview
              templateId={selectedTemplateId}
              templateProps={templateProps}
              onSave={handleSaveImage}
            />

            {/* Saved success message */}
            {savedSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
                {mi?.savedSuccess || localText(language, {
                  ar: 'تم حفظ الصورة بنجاح',
                  en: 'Image saved successfully',
                  fr: 'Image enregistree avec succes',
                })}
              </div>
            )}

            {/* Regenerate button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPicker(true)}
                className="text-sm text-[#0054A6] hover:underline font-medium"
              >
                {mi?.regenerate || localText(language, {
                  ar: 'إنشاء ملصق آخر',
                  en: 'Generate another poster',
                  fr: 'Generer une autre affiche',
                })}
              </button>
            </div>
          </div>
        )}

        {/* Saved images gallery */}
        <div>
          <h2
            className="text-lg font-bold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {mi?.myImages || 'My Images'}
          </h2>

          {savedImages === undefined ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[9/16] bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : savedImages.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">
                {mi?.noImages || 'No marketing images yet. Generate your first one!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {savedImages.map((img) => (
                <div
                  key={img._id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white"
                >
                  <div className="aspect-[9/16]">
                    <img
                      src={getR2PublicUrl(img.imageKey)}
                      alt={img.headline || 'Marketing image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      {mi?.delete || 'Delete'}
                    </button>
                  </div>
                  {/* Info bar */}
                  {img.headline && (
                    <div className="p-2 border-t border-slate-100">
                      <p className="text-xs text-slate-600 truncate">{img.headline}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product picker modal — simplified for marketing images (no description/delivery needed) */}
      {showPicker && seller && (
        <SimplifiedProductPicker
          sellerId={seller._id}
          onSelect={handleProductSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </DashboardLayout>
  );
}

/**
 * Simplified product picker — no description or delivery options needed for posters.
 * Just pick a product with images.
 */
function SimplifiedProductPicker({
  sellerId,
  onSelect,
  onClose,
}: {
  sellerId: string;
  onSelect: (product: Doc<'products'>) => void;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const products = useQuery(api.products.getProductsBySeller, {
    sellerId: sellerId as any,
  });

  const title = localText(language, {
    ar: 'اختر منتج لإنشاء ملصق',
    en: 'Pick a product for the poster',
    fr: 'Choisissez un produit pour l\'affiche',
  });

  const noProducts = localText(language, {
    ar: 'لا توجد منتجات بصور. أضف صور لمنتجاتك أولا.',
    en: 'No products with images found. Add images to your products first.',
    fr: 'Aucun produit avec image. Ajoutez des images a vos produits d\'abord.',
  });

  const productsWithImages = products?.filter(
    (p) => p.showOnStorefront && p.imageKeys && p.imageKeys.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
            {title}
          </h2>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!products ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !productsWithImages || productsWithImages.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{noProducts}</p>
          ) : (
            <div className="space-y-2">
              {productsWithImages.map((product) => (
                <button
                  key={product._id}
                  onClick={() => onSelect(product)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={getR2PublicUrl(product.imageKeys![0])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-bold text-[#F7941D]">
                            {product.salePrice.toLocaleString()} DZD
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {product.price.toLocaleString()} DZD
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">
                          {product.price.toLocaleString()} DZD
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-400 text-lg">&rarr;</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            {localText(language, { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' })}
          </button>
        </div>
      </div>
    </div>
  );
}
