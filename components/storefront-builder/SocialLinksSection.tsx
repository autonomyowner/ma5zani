'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SocialLinksSectionProps {
  storefront: Doc<'storefronts'> | null;
}

export default function SocialLinksSection({ storefront }: SocialLinksSectionProps) {
  const { language } = useLanguage();

  const [instagram, setInstagram] = useState(storefront?.socialLinks?.instagram || '');
  const [facebook, setFacebook] = useState(storefront?.socialLinks?.facebook || '');
  const [tiktok, setTiktok] = useState(storefront?.socialLinks?.tiktok || '');
  const [saving, setSaving] = useState(false);

  const updateStorefront = useMutation(api.storefronts.updateStorefront);

  useEffect(() => {
    if (storefront?.socialLinks) {
      setInstagram(storefront.socialLinks.instagram || '');
      setFacebook(storefront.socialLinks.facebook || '');
      setTiktok(storefront.socialLinks.tiktok || '');
    }
  }, [storefront]);

  const handleSave = async () => {
    if (!storefront) return;

    setSaving(true);
    try {
      await updateStorefront({
        socialLinks: {
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          tiktok: tiktok || undefined,
        },
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!storefront) {
    return (
      <div className="text-center py-8 text-slate-500">
        {localText(language, { ar: 'يرجى إنشاء متجرك أولاً', en: 'Please create your storefront first', fr: 'Veuillez d\'abord créer votre boutique' })}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <p className="text-slate-500 text-sm">
        {localText(language, { ar: 'أضف روابط حساباتك على وسائل التواصل الاجتماعي لعرضها في متجرك.', en: 'Add your social media links to display them on your storefront.', fr: 'Ajoutez vos liens de réseaux sociaux pour les afficher sur votre boutique.' })}
      </p>

      {/* Instagram */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Instagram
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">@</span>
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
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Facebook
        </label>
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
        <label className="block text-sm font-medium text-slate-700 mb-2">
          TikTok
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">@</span>
          <Input
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
            placeholder="yourusername"
            dir="ltr"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement...' })
          : localText(language, { ar: 'حفظ الروابط', en: 'Save Links', fr: 'Enregistrer les liens' })}
      </Button>
    </div>
  );
}
