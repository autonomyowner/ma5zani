'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import CheckoutForm from '@/components/storefront/CheckoutForm';

export default function CheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });

  // Get colors
  const colors = storefront ? {
    primary: storefront.colors?.primary || storefront.theme.primaryColor || '#0a0a0a',
    accent: storefront.colors?.accent || storefront.theme.accentColor || '#c9a962',
    background: storefront.colors?.background || '#0a0a0a',
    text: storefront.colors?.text || '#f5f5dc',
  } : null;

  // Loading state - Skeleton
  if (storefront === undefined) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="h-20" />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="w-40 h-6 rounded bg-white/10 skeleton-shimmer mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-12 rounded-xl bg-white/5 skeleton-shimmer" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-16 h-20 rounded bg-white/10 skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-3 rounded bg-white/10 skeleton-shimmer" />
                  <div className="w-1/2 h-3 rounded bg-white/10 skeleton-shimmer" />
                </div>
              </div>
              <div className="w-full h-12 rounded-xl bg-white/10 skeleton-shimmer mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!storefront || !colors) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <div className="text-center px-6">
          <h1
            className="text-2xl font-light mb-4"
            style={{ color: '#f5f5dc' }}
          >
            {isRTL ? 'المتجر غير موجود' : 'Store Not Found'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isRTL ? 'هذا المتجر غير موجود أو غير منشور' : "This store doesn't exist or is not published."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontLayout storefront={storefront}>
      <CheckoutForm
        slug={slug}
        accentColor={colors.accent}
        backgroundColor={colors.background}
        textColor={colors.text}
        metaPixelId={storefront.metaPixelId}
      />
    </StorefrontLayout>
  );
}
