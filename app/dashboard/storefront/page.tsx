'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import { useCurrentSeller } from '@/hooks/useCurrentSeller';
import { getR2PublicUrl } from '@/lib/r2';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SlugInput from '@/components/ui/SlugInput';
import FounderOfferGate from '@/components/dashboard/FounderOfferGate';

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
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPixel, setSavingPixel] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

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
      setInstagram(storefront.socialLinks?.instagram || '');
      setFacebook(storefront.socialLinks?.facebook || '');
      setTiktok(storefront.socialLinks?.tiktok || '');
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
      alert(localText(language, { ar: 'فشل رفع الصورة', en: 'Failed to upload image', fr: 'Échec du téléchargement de l\'image' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!boutiqueName.trim() || !slug.trim()) {
      alert(localText(language, { ar: 'يرجى إدخال اسم المتجر والرابط', en: 'Please enter store name and URL', fr: 'Veuillez entrer le nom et le lien de la boutique' }));
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
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('SLUG_TAKEN')) {
        alert(localText(language, {
          ar: 'هذا الرابط مستخدم بالفعل. يرجى اختيار رابط آخر.',
          en: 'This store URL is already taken. Please choose a different one.',
          fr: 'Ce lien de boutique est déjà utilisé. Veuillez en choisir un autre.',
        }));
      } else {
        alert(localText(language, {
          ar: 'فشل حفظ المتجر. حاول مرة أخرى.',
          en: 'Failed to save store. Please try again.',
          fr: 'Échec de l\'enregistrement. Veuillez réessayer.',
        }));
      }
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
      alert(localText(language, { ar: 'فشل حفظ البكسل', en: 'Failed to save pixel', fr: 'Échec de l\'enregistrement du pixel' }));
    } finally {
      setSavingPixel(false);
    }
  };

  const handleSaveSocial = async () => {
    if (!storefront) return;
    setSavingSocial(true);
    try {
      await updateStorefront({
        socialLinks: {
          instagram: instagram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
        },
      });
    } catch (error) {
      console.error('Save social links error:', error);
      alert(localText(language, { ar: 'فشل حفظ الروابط', en: 'Failed to save links', fr: 'Échec de l\'enregistrement des liens' }));
    } finally {
      setSavingSocial(false);
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

  if (seller && !seller.isActivated) {
    return (
      <DashboardLayout seller={seller} title={localText(language, { ar: 'متجرك الإلكتروني', en: 'Your Online Store', fr: 'Votre boutique en ligne' })}>
        <FounderOfferGate />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      seller={seller}
      title={localText(language, { ar: 'متجرك الإلكتروني', en: 'Your Online Store', fr: 'Votre boutique en ligne' })}
      subtitle={localText(language, { ar: 'أنشئ صفحة متجرك الخاصة وشارك الرابط مع عملائك', en: 'Create your store page and share the link with customers', fr: 'Créez votre page boutique et partagez le lien avec vos clients' })}
      headerActions={
        storefront && storefront.isPublished ? (
          <a
            href={`/${storefront.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 lg:px-4 py-1.5 lg:py-2 bg-[#22B14C] text-white rounded-xl font-medium hover:opacity-90 text-xs lg:text-sm"
          >
            {localText(language, { ar: 'عرض المتجر', en: 'View Store', fr: 'Voir la boutique' })}
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
            {localText(language, { ar: 'معلومات المتجر', en: 'Store Info', fr: 'Infos de la boutique' })}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {localText(language, { ar: 'اسم المتجر', en: 'Store Name', fr: 'Nom de la boutique' })} *
              </label>
              <Input
                value={boutiqueName}
                onChange={(e) => setBoutiqueName(e.target.value)}
                placeholder={localText(language, { ar: 'متجر الأناقة', en: 'My Fashion Store', fr: 'Ma Boutique Mode' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {localText(language, { ar: 'رابط المتجر', en: 'Store URL', fr: 'Lien de la boutique' })} *
              </label>
              <SlugInput value={slug} onChange={setSlug} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {localText(language, { ar: 'وصف قصير', en: 'Short Description', fr: 'Description courte' })}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={localText(language, { ar: 'نقدم أفضل المنتجات...', en: 'We offer the best products...', fr: 'Nous offrons les meilleurs produits...' })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
              />
            </div>
          </div>

          {/* Right: Logo & Colors */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                {localText(language, { ar: 'شعار المتجر', en: 'Store Logo', fr: 'Logo de la boutique' })}
              </label>
              <div className="flex items-center gap-3">
                {logoKey ? (
                  <div className="relative flex-shrink-0">
                    <img src={getR2PublicUrl(logoKey)} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full border" />
                    <button onClick={() => setLogoKey('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                    {localText(language, { ar: 'شعار', en: 'Logo', fr: 'Logo' })}
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" disabled={uploading} />
                  <label htmlFor="logo-upload" className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-medium cursor-pointer hover:bg-slate-200">
                    {uploading ? localText(language, { ar: 'جاري...', en: 'Uploading...', fr: 'Envoi...' }) : localText(language, { ar: 'رفع', en: 'Upload', fr: 'Envoyer' })}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  {localText(language, { ar: 'اللون الرئيسي', en: 'Primary', fr: 'Principale' })}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 sm:w-10 sm:h-10 rounded border cursor-pointer flex-shrink-0" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  {localText(language, { ar: 'لون الأزرار', en: 'Buttons', fr: 'Boutons' })}
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
            {saving ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement en cours...' }) : localText(language, { ar: 'حفظ التغييرات', en: 'Save Changes', fr: 'Enregistrer les modifications' })}
          </Button>
        </div>
      </div>

      {/* Step 2: Products */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">2</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {localText(language, { ar: 'اختر المنتجات', en: 'Products', fr: 'Produits' })}
            </h2>
          </div>
          <a href="/dashboard/products" className="text-xs sm:text-sm text-[#0054A6] hover:underline whitespace-nowrap">
            {localText(language, { ar: '+ إضافة', en: '+ Add', fr: '+ Ajouter' })}
          </a>
        </div>

        {products && products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">
              {localText(language, { ar: 'لا توجد منتجات. أضف منتجاتك أولاً.', en: 'No products yet. Add your products first.', fr: 'Pas encore de produits. Ajoutez vos produits d\'abord.' })}
            </p>
            <a href="/dashboard/products" className="inline-block px-6 py-2 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90">
              {localText(language, { ar: 'إضافة منتجات', en: 'Add Products', fr: 'Ajouter des produits' })}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Products on Storefront */}
            {storefrontProducts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-green-600 font-medium mb-2">
                  {localText(language, { ar: `${storefrontProducts.length} منتج في متجرك`, en: `${storefrontProducts.length} product(s) in your store`, fr: `${storefrontProducts.length} produit(s) dans votre boutique` })}
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
                      {localText(language, { ar: 'صورة', en: 'IMG', fr: 'IMG' })}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate text-sm sm:text-base">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{product.price.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DA' })}</p>
                </div>

                <span className={`hidden sm:inline text-xs px-2 py-1 rounded-full flex-shrink-0 ${product.showOnStorefront ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {product.showOnStorefront ? localText(language, { ar: 'ظاهر', en: 'Visible', fr: 'Visible' }) : localText(language, { ar: 'مخفي', en: 'Hidden', fr: 'Masqué' })}
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
              {localText(language, { ar: 'تخصيص القالب', en: 'Customize Template', fr: 'Personnaliser le modèle' })}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {localText(language, { ar: 'خصص مظهر متجرك: أضف صورة رئيسية، شريط إعلانات، منتجات مميزة، والمزيد.', en: 'Customize your store appearance: add hero banner, announcement bar, featured products, and more.', fr: 'Personnalisez l\'apparence de votre boutique : ajoutez une bannière, une barre d\'annonces, des produits vedettes, et plus.' })}
            </p>
            <a
              href="/dashboard/storefront/editor"
              className="inline-block px-4 py-2 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90 text-sm"
            >
              {localText(language, { ar: 'فتح محرر القالب', en: 'Open Template Editor', fr: 'Ouvrir l\'éditeur de modèle' })}
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
              {localText(language, { ar: 'نشر المتجر', en: 'Publish', fr: 'Publier' })}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm sm:text-base text-slate-600">
                {storefront.isPublished
                  ? localText(language, { ar: 'متجرك منشور ومتاح للعملاء', en: 'Your store is live', fr: 'Votre boutique est en ligne' })
                  : localText(language, { ar: 'متجرك غير منشور بعد', en: 'Not published yet', fr: 'Pas encore publié' })}
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
                  {localText(language, { ar: 'معاينة', en: 'Preview', fr: 'Aperçu' })}
                </a>
              )}
              <Button
                onClick={handlePublish}
                variant={storefront.isPublished ? 'secondary' : 'primary'}
                disabled={storefrontProducts.length === 0}
              >
                {storefront.isPublished
                  ? localText(language, { ar: 'إلغاء النشر', en: 'Unpublish', fr: 'Dépublier' })
                  : localText(language, { ar: 'نشر', en: 'Publish', fr: 'Publier' })}
              </Button>
            </div>
          </div>

          {storefrontProducts.length === 0 && !storefront.isPublished && (
            <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              {localText(language, { ar: 'أضف منتج واحد على الأقل لمتجرك قبل النشر', en: 'Add at least one product to your store before publishing', fr: 'Ajoutez au moins un produit à votre boutique avant de publier' })}
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
              {localText(language, { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' })}
            </h2>
          </div>

          {/* Meta Pixel Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Meta Pixel ID
              </label>
              <p className="text-xs text-slate-500 mb-2">
                {localText(language, { ar: 'أضف معرف البكسل لتتبع التحويلات', en: 'Add your Pixel ID to track conversions', fr: 'Ajoutez votre Pixel ID pour le suivi des conversions' })}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="123456789012345"
                  className="flex-1"
                />
                <Button onClick={handleSavePixel} disabled={savingPixel} variant="secondary" className="w-full sm:w-auto">
                  {savingPixel ? localText(language, { ar: 'جاري...', en: 'Saving...', fr: 'Enregistrement...' }) : localText(language, { ar: 'حفظ', en: 'Save', fr: 'Enregistrer' })}
                </Button>
              </div>
              {storefront.metaPixelId && (
                <p className="text-xs text-green-600 mt-2">
                  {localText(language, { ar: 'البكسل مفعّل', en: 'Pixel active', fr: 'Pixel actif' })}
                </p>
              )}
            </div>

            {/* Help text - collapsible on mobile */}
            <details className="bg-slate-50 rounded-xl">
              <summary className="p-3 sm:p-4 text-sm font-medium text-slate-600 cursor-pointer">
                {localText(language, { ar: 'كيفية الحصول على Pixel ID', en: 'How to get your Pixel ID', fr: 'Comment obtenir votre Pixel ID' })}
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-slate-600">
                <ol className={`list-decimal ${isRTL ? 'mr-4' : 'ml-4'} space-y-1`}>
                  <li>{localText(language, { ar: 'اذهب إلى Meta Events Manager', en: 'Go to Meta Events Manager', fr: 'Allez sur Meta Events Manager' })}</li>
                  <li>{localText(language, { ar: 'انقر على "Connect Data Sources"', en: 'Click "Connect Data Sources"', fr: 'Cliquez sur "Connect Data Sources"' })}</li>
                  <li>{localText(language, { ar: 'اختر "Web" ثم "Meta Pixel"', en: 'Select "Web" → "Meta Pixel"', fr: 'Sélectionnez "Web" puis "Meta Pixel"' })}</li>
                  <li>{localText(language, { ar: 'انسخ Pixel ID', en: 'Copy the Pixel ID', fr: 'Copiez le Pixel ID' })}</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Step 6: Social Media Links */}
      {storefront && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-sm sm:text-base">6</div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {localText(language, { ar: 'روابط التواصل الاجتماعي', en: 'Social Media Links', fr: 'Réseaux sociaux' })}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            {localText(language, { ar: 'أضف روابط حساباتك لعرضها في أسفل متجرك', en: 'Add your social media links to display them in your store footer', fr: 'Ajoutez vos liens de réseaux sociaux pour les afficher dans le pied de page de votre boutique' })}
          </p>

          <div className="space-y-4 max-w-xl">
            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">@</span>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  placeholder="yourusername"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">facebook.com/</span>
                <Input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="yourpage"
                  dir="ltr"
                />
              </div>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">@</span>
                <Input
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
                  placeholder="yourusername"
                  dir="ltr"
                />
              </div>
            </div>

            <Button onClick={handleSaveSocial} disabled={savingSocial} variant="secondary">
              {savingSocial
                ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement...' })
                : localText(language, { ar: 'حفظ الروابط', en: 'Save Links', fr: 'Enregistrer les liens' })}
            </Button>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
