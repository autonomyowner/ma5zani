'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { getR2PublicUrl } from '@/lib/r2';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SlugInput from '@/components/ui/SlugInput';

interface BrandingSectionProps {
  storefront: Doc<'storefronts'> | null;
}

export default function BrandingSection({ storefront }: BrandingSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [slug, setSlug] = useState(storefront?.slug || '');
  const [boutiqueName, setBoutiqueName] = useState(storefront?.boutiqueName || '');
  const [description, setDescription] = useState(storefront?.description || '');
  const [logoKey, setLogoKey] = useState(storefront?.logoKey || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const createStorefront = useMutation(api.storefronts.createStorefront);
  const updateStorefront = useMutation(api.storefronts.updateStorefront);
  const updateSlug = useMutation(api.storefronts.updateSlug);

  useEffect(() => {
    if (storefront) {
      setSlug(storefront.slug);
      setBoutiqueName(storefront.boutiqueName);
      setDescription(storefront.description || '');
      setLogoKey(storefront.logoKey || '');
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
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!boutiqueName.trim() || !slug.trim()) {
      alert(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      if (storefront) {
        // Update existing
        await updateStorefront({
          boutiqueName,
          description: description || undefined,
          logoKey: logoKey || undefined,
        });
        if (slug !== storefront.slug) {
          await updateSlug({ slug });
        }
      } else {
        // Create new
        await createStorefront({
          slug,
          boutiqueName,
          description: description || undefined,
          logoKey: logoKey || undefined,
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isRTL ? 'شعار المتجر' : 'Store Logo'}
        </label>
        <div className="flex items-center gap-4">
          {logoKey ? (
            <div className="relative">
              <img
                src={getR2PublicUrl(logoKey)}
                alt="Logo"
                className="w-20 h-20 object-cover rounded-xl border border-slate-200"
              />
              <button
                onClick={() => setLogoKey('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold"
              >
                x
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
              <span className="text-slate-400 text-xs text-center">
                {isRTL ? 'لا يوجد شعار' : 'No logo'}
              </span>
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="logo-upload"
              className={`inline-flex items-center justify-center px-6 py-3 text-base rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                uploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-[#0054A6] text-white hover:bg-[#003d7a]'
              }`}
            >
              {uploading
                ? isRTL
                  ? 'جاري الرفع...'
                  : 'Uploading...'
                : isRTL
                ? 'رفع شعار'
                : 'Upload Logo'}
            </label>
            <p className="text-xs text-slate-400 mt-1">
              {isRTL ? 'PNG, JPG حتى 2MB' : 'PNG, JPG up to 2MB'}
            </p>
          </div>
        </div>
      </div>

      {/* Store URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isRTL ? 'رابط المتجر' : 'Store URL'} *
        </label>
        <SlugInput value={slug} onChange={setSlug} />
      </div>

      {/* Boutique Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isRTL ? 'اسم المتجر' : 'Store Name'} *
        </label>
        <Input
          value={boutiqueName}
          onChange={(e) => setBoutiqueName(e.target.value)}
          placeholder={isRTL ? 'متجر الأناقة' : 'My Fashion Store'}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isRTL ? 'وصف المتجر' : 'Store Description'}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isRTL
              ? 'نقدم أفضل المنتجات بأسعار تنافسية...'
              : 'We offer the best products at competitive prices...'
          }
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
        />
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? isRTL
            ? 'جاري الحفظ...'
            : 'Saving...'
          : storefront
          ? isRTL
            ? 'حفظ التغييرات'
            : 'Save Changes'
          : isRTL
          ? 'إنشاء المتجر'
          : 'Create Storefront'}
      </Button>
    </div>
  );
}
