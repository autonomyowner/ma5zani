'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
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
  const metaPixelId = storefront.metaPixelId;

  // Initialize Meta Pixel when component mounts
  useEffect(() => {
    if (metaPixelId && typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) {
      // Track PageView when storefront loads
      (window as unknown as { fbq: (action: string, event: string) => void }).fbq('track', 'PageView');
    }
  }, [metaPixelId]);

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        '--primary-color': storefront.theme.primaryColor,
        '--accent-color': storefront.theme.accentColor,
      } as React.CSSProperties}
    >
      {/* Meta Pixel Script */}
      {metaPixelId && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
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
