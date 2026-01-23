'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import CheckoutForm from '@/components/storefront/CheckoutForm';

export default function CheckoutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });

  // Loading state
  if (storefront === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // Not found state
  if (!storefront) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h1>
          <p className="text-slate-500">This store doesn&apos;t exist or is not published.</p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontLayout storefront={storefront}>
      <CheckoutForm slug={slug} accentColor={storefront.theme.accentColor} />
    </StorefrontLayout>
  );
}
