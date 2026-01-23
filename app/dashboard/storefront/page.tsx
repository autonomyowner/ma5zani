'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { getR2PublicUrl } from '@/lib/r2';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SlugInput from '@/components/ui/SlugInput';

export default function StorefrontPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const seller = useQuery(api.sellers.getCurrentSellerProfile);
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

  if (!isLoaded || seller === undefined || storefront === undefined || products === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (seller === null && user) {
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold">1</div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isRTL ? 'معلومات المتجر' : 'Store Info'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isRTL ? 'شعار المتجر' : 'Store Logo'}
              </label>
              <div className="flex items-center gap-4">
                {logoKey ? (
                  <div className="relative">
                    <img src={getR2PublicUrl(logoKey)} alt="Logo" className="w-16 h-16 object-cover rounded-xl border" />
                    <button onClick={() => setLogoKey('')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                    {isRTL ? 'شعار' : 'Logo'}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={uploading} />
                  <label htmlFor="logo-upload" className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200">
                    {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع صورة' : 'Upload')}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isRTL ? 'اللون الرئيسي' : 'Primary Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isRTL ? 'لون الأزرار' : 'Button Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
          </Button>
        </div>
      </div>

      {/* Step 2: Products */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isRTL ? 'اختر المنتجات' : 'Choose Products'}
            </h2>
          </div>
          <a href="/dashboard/products" className="text-sm text-[#0054A6] hover:underline">
            {isRTL ? '+ إضافة منتج جديد' : '+ Add new product'}
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
              <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                <button
                  onClick={() => handleToggleProduct(product._id, product.showOnStorefront || false)}
                  className="w-12 h-6 rounded-full transition-colors relative"
                  style={{ backgroundColor: product.showOnStorefront ? '#22c55e' : '#cbd5e1' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                    style={{ right: product.showOnStorefront ? '4px' : 'auto', left: product.showOnStorefront ? 'auto' : '4px' }}
                  />
                </button>

                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.imageKeys && product.imageKeys.length > 0 ? (
                    <img src={getR2PublicUrl(product.imageKeys[0])} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      {isRTL ? 'صورة' : 'IMG'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500">{product.price.toLocaleString()} {isRTL ? 'دج' : 'DZD'}</p>
                </div>

                <span className={`text-xs px-2 py-1 rounded-full ${product.showOnStorefront ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {product.showOnStorefront ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Publish */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isRTL ? 'نشر المتجر' : 'Publish Store'}
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600">
                {storefront.isPublished
                  ? (isRTL ? 'متجرك منشور ومتاح للعملاء' : 'Your store is live and accessible')
                  : (isRTL ? 'متجرك غير منشور بعد' : 'Your store is not published yet')}
              </p>
              {storefront.isPublished && (
                <a
                  href={`/${storefront.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0054A6] hover:underline"
                >
                  ma5zani.vercel.app/{storefront.slug}
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              {storefront.isPublished && (
                <a
                  href={`/${storefront.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
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
                  : (isRTL ? 'نشر المتجر' : 'Publish Store')}
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

      {/* Step 4: Settings (Meta Pixel) */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold">4</div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isRTL ? 'الإعدادات' : 'Settings'}
            </h2>
          </div>

          {/* Meta Pixel Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRTL ? 'Meta Pixel ID' : 'Meta Pixel ID'}
              </label>
              <p className="text-xs text-slate-500 mb-2">
                {isRTL
                  ? 'أضف معرف البكسل الخاص بك من Meta لتتبع التحويلات والإعلانات'
                  : 'Add your Meta Pixel ID to track conversions and ads performance'}
              </p>
              <div className="flex gap-2">
                <Input
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder={isRTL ? 'مثال: 123456789012345' : 'e.g., 123456789012345'}
                  className="flex-1"
                />
                <Button onClick={handleSavePixel} disabled={savingPixel} variant="secondary">
                  {savingPixel ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                </Button>
              </div>
              {storefront.metaPixelId && (
                <p className="text-xs text-green-600 mt-2">
                  {isRTL ? 'البكسل مفعّل' : 'Pixel is active'}
                </p>
              )}
            </div>

            {/* Help text */}
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <p className="font-medium mb-2">{isRTL ? 'كيفية الحصول على Meta Pixel ID:' : 'How to get your Meta Pixel ID:'}</p>
              <ol className={`list-decimal ${isRTL ? 'mr-4' : 'ml-4'} space-y-1`}>
                <li>{isRTL ? 'اذهب إلى Meta Events Manager' : 'Go to Meta Events Manager'}</li>
                <li>{isRTL ? 'انقر على "Connect Data Sources"' : 'Click on "Connect Data Sources"'}</li>
                <li>{isRTL ? 'اختر "Web" ثم "Meta Pixel"' : 'Select "Web" then "Meta Pixel"'}</li>
                <li>{isRTL ? 'انسخ Pixel ID (رقم مكون من 15-16 رقم)' : 'Copy the Pixel ID (15-16 digit number)'}</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
