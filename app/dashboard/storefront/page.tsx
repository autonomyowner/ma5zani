'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { useCurrentSeller } from '@/hooks/useCurrentSeller';
import { getR2PublicUrl } from '@/lib/r2';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SlugInput from '@/components/ui/SlugInput';

export default function StorefrontPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const { seller, isLoading, isAuthenticated } = useCurrentSeller();
  const storefront = useQuery(api.storefronts.getMyStorefront);
  const products = useQuery(api.products.getProducts);
  const createStorefront = useMutation(api.storefronts.createStorefront);
  const updateStorefront = useMutation(api.storefronts.updateStorefront);
  const updateSlug = useMutation(api.storefronts.updateSlug);
  const publishStorefront = useMutation(api.storefronts.publishStorefront);
  const updateProduct = useMutation(api.products.updateProduct);

  const [slug, setSlug] = useState('');
  const [boutiqueName, setBoutiqueName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0054A6');
  const [accentColor, setAccentColor] = useState('#F7941D');
  const [logoKey, setLogoKey] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPixel, setSavingPixel] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  // Initialize form when storefront loads
  useEffect(() => {
    if (storefront) {
      setSlug(storefront.slug);
      setBoutiqueName(storefront.boutiqueName);
      setDescription(storefront.description || '');
      setPrimaryColor(storefront.theme.primaryColor);
      setAccentColor(storefront.theme.accentColor);
      setLogoKey(storefront.logoKey || '');
      setMetaPixelId(storefront.metaPixelId || '');
    }
  }, [storefront]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'logos',
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');
      setLogoKey(key);
    } catch (error) {
      console.error('Upload error:', error);
      alert(isRTL ? 'فشل رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!boutiqueName.trim() || !slug.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم المتجر والرابط' : 'Please enter store name and URL');
      return;
    }

    setSaving(true);
    try {
      if (storefront) {
        await updateStorefront({
          boutiqueName,
          description: description || undefined,
          logoKey: logoKey || undefined,
          theme: { primaryColor, accentColor },
        });
        if (slug !== storefront.slug) {
          await updateSlug({ slug });
        }
      } else {
        await createStorefront({
          slug,
          boutiqueName,
          description: description || undefined,
          logoKey: logoKey || undefined,
          theme: { primaryColor, accentColor },
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = async (productId: Id<'products'>, currentValue: boolean) => {
    try {
      await updateProduct({
        productId,
        showOnStorefront: !currentValue,
      });
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to update product visibility');
    }
  };

  const handlePublish = async () => {
    if (!storefront) return;
    try {
      await publishStorefront({ isPublished: !storefront.isPublished });
    } catch (error) {
      console.error('Publish error:', error);
      alert(error instanceof Error ? error.message : 'Failed to publish');
    }
  };

  const handleSavePixel = async () => {
    if (!storefront) return;

    setSavingPixel(true);
    try {
      await updateStorefront({
        metaPixelId: metaPixelId.trim() || undefined,
      });
    } catch (error) {
      console.error('Save pixel error:', error);
      alert(isRTL ? 'فشل حفظ البكسل' : 'Failed to save pixel');
    } finally {
      setSavingPixel(false);
    }
  };

  const storefrontProducts = products?.filter(p => p.showOnStorefront) || [];
  const availableProducts = products?.filter(p => !p.showOnStorefront) || [];

  if (isLoading || seller === undefined || storefront === undefined || products === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (seller === null && isAuthenticated) {
    router.push('/onboarding');
    return null;
  }

  return (
    <DashboardLayout
      seller={seller}
      title={isRTL ? 'متجرك الإلكتروني' : 'Your Online Store'}
      subtitle={isRTL ? 'أنشئ صفحة متجرك الخاصة وشارك الرابط مع عملائك' : 'Create your store page and share the link with customers'}
      headerActions={
        storefront && storefront.isPublished ? (
          <a
            href={`/${storefront.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 lg:px-4 py-1.5 lg:py-2 bg-[#22B14C] text-white rounded-xl font-medium hover:opacity-90 text-xs lg:text-sm"
          >
            {isRTL ? 'عرض المتجر' : 'View Store'}
          </a>
        ) : undefined
      }
    >
      <div className="max-w-4xl space-y-4 lg:space-y-8">
          {/* Step 1: Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">1</div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            {isRTL ? 'معلومات المتجر' : 'Store Info'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRTL ? 'اسم المتجر' : 'Store Name'} *
              </label>
              <Input
                value={boutiqueName}
                onChange={(e) => setBoutiqueName(e.target.value)}
                placeholder={isRTL ? 'متجر الأناقة' : 'My Fashion Store'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRTL ? 'رابط المتجر' : 'Store URL'} *
              </label>
              <SlugInput value={slug} onChange={setSlug} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRTL ? 'وصف قصير' : 'Short Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRTL ? 'نقدم أفضل المنتجات...' : 'We offer the best products...'}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
              />
            </div>
          </div>

          {/* Right: Logo & Colors */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                {isRTL ? 'شعار المتجر' : 'Store Logo'}
              </label>
              <div className="flex items-center gap-3">
                {logoKey ? (
                  <div className="relative flex-shrink-0">
                    <img src={getR2PublicUrl(logoKey)} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full border" />
                    <button onClick={() => setLogoKey('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                    {isRTL ? 'شعار' : 'Logo'}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={uploading} />
                  <label htmlFor="logo-upload" className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-medium cursor-pointer hover:bg-slate-200">
                    {uploading ? (isRTL ? 'جاري...' : 'Uploading...') : (isRTL ? 'رفع' : 'Upload')}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  {isRTL ? 'اللون الرئيسي' : 'Primary'}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 sm:w-10 sm:h-10 rounded border cursor-pointer flex-shrink-0" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  {isRTL ? 'لون الأزرار' : 'Buttons'}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 sm:w-10 sm:h-10 rounded border cursor-pointer flex-shrink-0" />
                  <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
          </Button>
        </div>
      </div>

      {/* Step 2: Products */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">2</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {isRTL ? 'اختر المنتجات' : 'Products'}
            </h2>
          </div>
          <a href="/dashboard/products" className="text-xs sm:text-sm text-[#0054A6] hover:underline whitespace-nowrap">
            {isRTL ? '+ إضافة' : '+ Add'}
          </a>
        </div>

        {products && products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">
              {isRTL ? 'لا توجد منتجات. أضف منتجاتك أولاً.' : 'No products yet. Add your products first.'}
            </p>
            <a href="/dashboard/products" className="inline-block px-6 py-2 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90">
              {isRTL ? 'إضافة منتجات' : 'Add Products'}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Products on Storefront */}
            {storefrontProducts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-green-600 font-medium mb-2">
                  {isRTL ? `${storefrontProducts.length} منتج في متجرك` : `${storefrontProducts.length} product(s) in your store`}
                </p>
              </div>
            )}

            {products?.map((product) => (
              <div key={product._id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                <button
                  onClick={() => handleToggleProduct(product._id, product.showOnStorefront || false)}
                  className="w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors relative flex-shrink-0"
                  style={{ backgroundColor: product.showOnStorefront ? '#22c55e' : '#cbd5e1' }}
                >
                  <span
                    className="absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-transform"
                    style={{ right: product.showOnStorefront ? '2px' : 'auto', left: product.showOnStorefront ? 'auto' : '2px' }}
                  />
                </button>

                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.imageKeys && product.imageKeys.length > 0 ? (
                    <img src={getR2PublicUrl(product.imageKeys[0])} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] sm:text-xs">
                      {isRTL ? 'صورة' : 'IMG'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate text-sm sm:text-base">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{product.price.toLocaleString()} {isRTL ? 'دج' : 'DZD'}</p>
                </div>

                <span className={`hidden sm:inline text-xs px-2 py-1 rounded-full flex-shrink-0 ${product.showOnStorefront ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {product.showOnStorefront ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Customize Template */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">3</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {isRTL ? 'تخصيص القالب' : 'Customize Template'}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {isRTL
                ? 'خصص مظهر متجرك: أضف صورة رئيسية، شريط إعلانات، منتجات مميزة، والمزيد.'
                : 'Customize your store appearance: add hero banner, announcement bar, featured products, and more.'}
            </p>
            <a
              href="/dashboard/storefront/editor"
              className="inline-block px-4 py-2 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90 text-sm"
            >
              {isRTL ? 'فتح محرر القالب' : 'Open Template Editor'}
            </a>
          </div>
        </div>
      )}

      {/* Step 4: Publish */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">4</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {isRTL ? 'نشر المتجر' : 'Publish'}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm sm:text-base text-slate-600">
                {storefront.isPublished
                  ? (isRTL ? 'متجرك منشور ومتاح للعملاء' : 'Your store is live')
                  : (isRTL ? 'متجرك غير منشور بعد' : 'Not published yet')}
              </p>
              {storefront.isPublished && (
                <a
                  href={`/${storefront.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-[#0054A6] hover:underline break-all"
                >
                  ma5zani.com/{storefront.slug}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {storefront.isPublished && (
                <a
                  href={`/${storefront.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm"
                >
                  {isRTL ? 'معاينة' : 'Preview'}
                </a>
              )}
              <Button
                onClick={handlePublish}
                variant={storefront.isPublished ? 'secondary' : 'primary'}
                disabled={storefrontProducts.length === 0}
              >
                {storefront.isPublished
                  ? (isRTL ? 'إلغاء النشر' : 'Unpublish')
                  : (isRTL ? 'نشر' : 'Publish')}
              </Button>
            </div>
          </div>

          {storefrontProducts.length === 0 && !storefront.isPublished && (
            <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              {isRTL
                ? 'أضف منتج واحد على الأقل لمتجرك قبل النشر'
                : 'Add at least one product to your store before publishing'}
            </p>
          )}
        </div>
      )}

      {/* Step 5: Settings (Meta Pixel) */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">5</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {isRTL ? 'الإعدادات' : 'Settings'}
            </h2>
          </div>

          {/* Meta Pixel Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Meta Pixel ID
              </label>
              <p className="text-xs text-slate-500 mb-2">
                {isRTL
                  ? 'أضف معرف البكسل لتتبع التحويلات'
                  : 'Add your Pixel ID to track conversions'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder={isRTL ? '123456789012345' : '123456789012345'}
                  className="flex-1"
                />
                <Button onClick={handleSavePixel} disabled={savingPixel} variant="secondary" className="w-full sm:w-auto">
                  {savingPixel ? (isRTL ? 'جاري...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                </Button>
              </div>
              {storefront.metaPixelId && (
                <p className="text-xs text-green-600 mt-2">
                  {isRTL ? 'البكسل مفعّل' : 'Pixel active'}
                </p>
              )}
            </div>

            {/* Help text - collapsible on mobile */}
            <details className="bg-slate-50 rounded-xl">
              <summary className="p-3 sm:p-4 text-sm font-medium text-slate-600 cursor-pointer">
                {isRTL ? 'كيفية الحصول على Pixel ID' : 'How to get your Pixel ID'}
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-slate-600">
                <ol className={`list-decimal ${isRTL ? 'mr-4' : 'ml-4'} space-y-1`}>
                  <li>{isRTL ? 'اذهب إلى Meta Events Manager' : 'Go to Meta Events Manager'}</li>
                  <li>{isRTL ? 'انقر على "Connect Data Sources"' : 'Click "Connect Data Sources"'}</li>
                  <li>{isRTL ? 'اختر "Web" ثم "Meta Pixel"' : 'Select "Web" → "Meta Pixel"'}</li>
                  <li>{isRTL ? 'انسخ Pixel ID' : 'Copy the Pixel ID'}</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
