'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Doc } from '@/convex/_generated/dataModel';
import { getR2PublicUrl } from '@/lib/r2';
import StorefrontHeader from './StorefrontHeader';
import CartDrawer from './CartDrawer';

interface StorefrontLayoutProps {
  storefront: Doc<'storefronts'>;
  children: ReactNode;
}

export default function StorefrontLayout({ storefront, children }: StorefrontLayoutProps) {
  const logoUrl = storefront.logoKey ? getR2PublicUrl(storefront.logoKey) : null;

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        '--primary-color': storefront.theme.primaryColor,
        '--accent-color': storefront.theme.accentColor,
      } as React.CSSProperties}
    >
      <StorefrontHeader
        slug={storefront.slug}
        boutiqueName={storefront.boutiqueName}
        logoUrl={logoUrl}
        socialLinks={storefront.socialLinks}
        primaryColor={storefront.theme.primaryColor}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href={`/${storefront.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {logoUrl && (
                <img src={logoUrl} alt={storefront.boutiqueName} className="w-10 h-10 rounded-lg object-cover" />
              )}
              <span className="font-semibold" style={{ color: storefront.theme.primaryColor }}>
                {storefront.boutiqueName}
              </span>
            </Link>
            {storefront.description && (
              <p className="text-sm text-slate-500 text-center md:text-right max-w-md">
                {storefront.description}
              </p>
            )}
            <div className="text-sm text-slate-400">
              Powered by{' '}
              <a href="https://ma5zani.com" className="text-[#0054A6] hover:underline">
                ma5zani
              </a>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer slug={storefront.slug} accentColor={storefront.theme.accentColor} />
    </div>
  );
}
