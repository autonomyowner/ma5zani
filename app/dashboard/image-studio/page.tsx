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
import { getR2PublicUrl } from '@/lib/r2';
import { localText } from '@/lib/translations';

type Style = 'professional' | 'lifestyle' | 'promo' | 'social';
type Format = 'story' | 'square' | 'landscape';

export default function ImageStudioPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const is = (t as unknown as Record<string, Record<string, string>>).imageStudio;

  const seller = useQuery(api.sellers.getCurrentSellerProfile);
  const storefront = useQuery(api.storefronts.getMyStorefront);
  const savedImages = useQuery(api.marketingImages.getMyMarketingImages);

  const saveImageMutation = useMutation(api.marketingImages.saveMarketingImage);
  const deleteImageMutation = useMutation(api.marketingImages.deleteMarketingImage);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Doc<'products'> | null>(null);
  const [style, setStyle] = useState<Style>('professional');
  const [format, setFormat] = useState<Format>('story');
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  if (!sellerHasAccess(seller)) {
    return (
      <DashboardLayout seller={seller} title={is?.title || 'Image Studio'}>
        <FounderOfferGate />
      </DashboardLayout>
    );
  }

  const storeName = storefront?.boutiqueName || seller.name || 'Ma5zani Store';

  const styles: { id: Style; label: string; desc: string; icon: string }[] = [
    {
      id: 'professional',
      label: is?.styleProfessional || 'Professional Shot',
      desc: is?.styleProfessionalDesc || 'Clean background, studio lighting',
      icon: 'M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z',
    },
    {
      id: 'lifestyle',
      label: is?.styleLifestyle || 'Lifestyle Scene',
      desc: is?.styleLifestyleDesc || 'Product in a natural setting',
      icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z',
    },
    {
      id: 'promo',
      label: is?.stylePromo || 'Sale / Promo',
      desc: is?.stylePromoDesc || 'Sale design with prominent pricing',
      icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
    },
    {
      id: 'social',
      label: is?.styleSocial || 'Social Media Ad',
      desc: is?.styleSocialDesc || 'Optimized for paid ads',
      icon: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46',
    },
  ];

  const formats: { id: Format; label: string; ratio: string }[] = [
    { id: 'story', label: is?.formatStory || 'Story', ratio: '9:16' },
    { id: 'square', label: is?.formatSquare || 'Square', ratio: '1:1' },
    { id: 'landscape', label: is?.formatLandscape || 'Landscape', ratio: '16:9' },
  ];

  const handleProductSelect = (product: Doc<'products'>) => {
    setSelectedProduct(product);
    setShowPicker(false);
    setResultImage(null);
    setResultKey(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    if (!selectedProduct.imageKeys?.length) {
      setError(is?.errorNoImage || 'This product has no images');
      return;
    }

    setError('');
    setResultImage(null);
    setResultKey(null);
    setGenerating(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/image-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller!._id,
          productId: selectedProduct._id,
          style,
          format,
          storeName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResultImage(data.imageBase64);
      setResultKey(data.imageKey);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || is?.errorGeneration || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `${selectedProduct?.name || 'image'}-${style}-${format}.png`;
    link.click();
  };

  const handleSave = async () => {
    if (!resultKey || !selectedProduct) return;

    try {
      await saveImageMutation({
        productId: selectedProduct._id,
        style,
        format,
        imageKey: resultKey,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(is?.errorSave || 'Failed to save image');
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm(is?.deleteConfirm || 'Delete this image?')) return;
    try {
      await deleteImageMutation({ id });
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <DashboardLayout seller={seller} title={is?.title || 'Image Studio'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {is?.title || 'Image Studio'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {is?.subtitle || 'Generate professional marketing images with AI'}
          </p>
        </div>

        {/* Generator Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          {/* Step 1: Product picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {is?.pickProduct || 'Pick a product'}
            </label>
            {selectedProduct ? (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:border-[#0054A6]/30 transition-colors text-left"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {selectedProduct.imageKeys?.[0] && (
                    <img
                      src={getR2PublicUrl(selectedProduct.imageKeys[0])}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{selectedProduct.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedProduct.salePrice
                      ? `${selectedProduct.salePrice.toLocaleString()} DZD`
                      : `${selectedProduct.price.toLocaleString()} DZD`}
                  </p>
                </div>
                <span className="text-xs text-[#0054A6] font-medium">
                  {localText(language, { ar: 'تغيير', en: 'Change', fr: 'Changer' })}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-[#0054A6]/40 hover:text-[#0054A6] transition-colors text-sm font-medium"
              >
                + {is?.pickProduct || 'Pick a product'}
              </button>
            )}
          </div>

          {/* Step 2: Style selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              {is?.styleLabel || 'Image Style'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    style === s.id
                      ? 'border-[#0054A6] bg-[#0054A6]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <svg
                    className={`w-6 h-6 mb-2 ${style === s.id ? 'text-[#0054A6]' : 'text-slate-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                  <p className={`text-sm font-medium ${style === s.id ? 'text-[#0054A6]' : 'text-slate-700'}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Format selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              {is?.formatLabel || 'Format'}
            </label>
            <div className="flex gap-3">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    format === f.id
                      ? 'bg-[#0054A6] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label} <span className="opacity-60">({f.ratio})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedProduct || generating}
            className="w-full py-3 bg-[#0054A6] text-white rounded-xl font-semibold text-base hover:bg-[#004590] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
                </svg>
                {is?.generating || 'AI is working...'}
              </span>
            ) : (
              is?.generate || 'Generate Image'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
            <button onClick={() => setError('')} className="float-right text-red-400 hover:text-red-600 ml-2">
              &times;
            </button>
          </div>
        )}

        {/* Result */}
        {resultImage && (
          <div className="mb-8 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex justify-center mb-4">
              <div
                className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50"
                style={{
                  maxWidth: format === 'landscape' ? '600px' : format === 'square' ? '400px' : '300px',
                }}
              >
                <img src={resultImage} alt="Generated" className="w-full h-auto" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
              >
                {is?.download || 'Download'}
              </button>
              <button
                onClick={handleSave}
                disabled={!resultKey}
                className="px-6 py-2.5 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors text-sm disabled:opacity-50"
              >
                {is?.save || 'Save to Gallery'}
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
              >
                {is?.regenerate || 'Generate another'}
              </button>
            </div>

            {savedSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
                {is?.savedSuccess || 'Image saved successfully'}
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        <div>
          <h2
            className="text-lg font-bold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {is?.myImages || 'My Gallery'}
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
                {is?.noImages || 'No images yet. Generate your first one!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {savedImages.map((img) => (
                <div
                  key={img._id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white"
                >
                  <div
                    className={
                      img.format === 'landscape'
                        ? 'aspect-[16/9]'
                        : img.format === 'square'
                        ? 'aspect-square'
                        : 'aspect-[9/16]'
                    }
                  >
                    <img
                      src={getR2PublicUrl(img.imageKey)}
                      alt="Marketing image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      {is?.delete || 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product picker modal */}
      {showPicker && seller && (
        <ProductPickerModal
          sellerId={seller._id}
          onSelect={handleProductSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </DashboardLayout>
  );
}

function ProductPickerModal({
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

  const productsWithImages = products?.filter(
    (p) => p.showOnStorefront && p.imageKeys && p.imageKeys.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
            {localText(language, {
              ar: 'اختر منتج',
              en: 'Pick a product',
              fr: 'Choisissez un produit',
            })}
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
            <p className="text-center text-slate-500 py-8">
              {localText(language, {
                ar: 'لا توجد منتجات بصور. أضف صور لمنتجاتك أولاً.',
                en: 'No products with images found. Add images to your products first.',
                fr: 'Aucun produit avec image. Ajoutez des images d\'abord.',
              })}
            </p>
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
