'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import Button from '@/components/ui/Button';
import BrandingSection from './BrandingSection';
import ThemeSection from './ThemeSection';
import SocialLinksSection from './SocialLinksSection';
import SettingsSection from './SettingsSection';

type Tab = 'branding' | 'theme' | 'social' | 'settings';

export default function StorefrontEditor() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('branding');

  const storefront = useQuery(api.storefronts.getMyStorefront);
  const publishStorefront = useMutation(api.storefronts.publishStorefront);

  const isRTL = language === 'ar';

  const tabs: { id: Tab; labelEn: string; labelAr: string }[] = [
    { id: 'branding', labelEn: 'Branding', labelAr: 'العلامة التجارية' },
    { id: 'theme', labelEn: 'Theme', labelAr: 'المظهر' },
    { id: 'social', labelEn: 'Social Links', labelAr: 'روابط التواصل' },
    { id: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات' },
  ];

  const handlePublish = async () => {
    if (!storefront) return;
    try {
      await publishStorefront({ isPublished: !storefront.isPublished });
    } catch (error) {
      console.error('Publish error:', error);
      alert(error instanceof Error ? error.message : 'Failed to publish');
    }
  };

  if (storefront === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            {isRTL ? 'منشئ المتجر' : 'Storefront Builder'}
          </h1>
          {storefront && (
            <p className="text-slate-500 mt-1">
              ma5zani.com/{storefront.slug}
            </p>
          )}
        </div>

        {storefront && (
          <div className="flex items-center gap-3">
            <a
              href={`/${storefront.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0054A6] hover:underline text-sm"
            >
              {isRTL ? 'معاينة' : 'Preview'}
            </a>
            <Button
              onClick={handlePublish}
              variant={storefront.isPublished ? 'secondary' : 'primary'}
            >
              {storefront.isPublished
                ? isRTL
                  ? 'إلغاء النشر'
                  : 'Unpublish'
                : isRTL
                ? 'نشر المتجر'
                : 'Publish'}
            </Button>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {storefront && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            storefront.isPublished
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              storefront.isPublished ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          ></span>
          {storefront.isPublished
            ? isRTL
              ? 'منشور'
              : 'Published'
            : isRTL
            ? 'مسودة'
            : 'Draft'}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#0054A6] text-[#0054A6]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRTL ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {activeTab === 'branding' && <BrandingSection storefront={storefront} />}
        {activeTab === 'theme' && <ThemeSection storefront={storefront} />}
        {activeTab === 'social' && <SocialLinksSection storefront={storefront} />}
        {activeTab === 'settings' && <SettingsSection storefront={storefront} />}
      </div>
    </div>
  );
}
