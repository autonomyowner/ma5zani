'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Doc } from '@/convex/_generated/dataModel';
import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import StorefrontHeader from './StorefrontHeader';
import CartDrawer from './CartDrawer';
import ChatbotWidget from './ChatbotWidget';

interface StorefrontLayoutProps {
  storefront: Doc<'storefronts'>;
  children: ReactNode;
}

// Generate Google Fonts URL from custom fonts
function getGoogleFontsUrl(fonts: { display: string; body: string; arabic: string }): string {
  const fontFamilies = [
    fonts.display.replace(/ /g, '+'),
    fonts.body.replace(/ /g, '+'),
    fonts.arabic.replace(/ /g, '+'),
  ];
  const uniqueFonts = [...new Set(fontFamilies)];
  const families = uniqueFonts.map((font) => `family=${font}:wght@300;400;500;600;700`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

// Helper to determine if a color is light
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default function StorefrontLayout({ storefront, children }: StorefrontLayoutProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const logoUrl = storefront.logoKey ? getR2PublicUrl(storefront.logoKey) : null;
  const metaPixelId = storefront.metaPixelId;

  // Use extended colors if available, fallback to theme colors
  const colors = {
    primary: storefront.colors?.primary || storefront.theme.primaryColor || '#0a0a0a',
    accent: storefront.colors?.accent || storefront.theme.accentColor || '#c9a962',
    background: storefront.colors?.background || '#0a0a0a',
    text: storefront.colors?.text || '#f5f5dc',
    headerBg: storefront.colors?.headerBg || '#0a0a0a',
    footerBg: storefront.colors?.footerBg || '#0a0a0a',
  };

  // Derived colors
  const isLightBg = isLightColor(colors.background);
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)';
  const textSubtle = isLightBg ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  // Custom fonts from AI builder
  const fonts = storefront.fonts || {
    display: 'Playfair Display',
    body: 'Inter',
    arabic: 'Tajawal',
  };
  const googleFontsUrl = useMemo(() => getGoogleFontsUrl(fonts), [fonts]);

  // Footer configuration
  const footer = storefront.footer || { showPoweredBy: true };
  const footerCustomText = language === 'ar' ? footer.customTextAr : footer.customText;

  // Initialize Meta Pixel
  useEffect(() => {
    if (metaPixelId && typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) {
      (window as unknown as { fbq: (action: string, event: string) => void }).fbq('track', 'PageView');
    }
  }, [metaPixelId]);

  return (
    <div
      className="min-h-screen"
      style={{
        '--color-primary': colors.primary,
        '--color-accent': colors.accent,
        '--color-background': colors.background,
        '--color-text': colors.text,
        '--color-text-muted': textMuted,
        '--color-text-subtle': textSubtle,
        '--color-border': borderColor,
        '--color-header-bg': colors.headerBg,
        '--color-footer-bg': colors.footerBg,
        '--font-display': `'${fonts.display}', serif`,
        '--font-body': `'${fonts.body}', sans-serif`,
        '--font-arabic': `'${fonts.arabic}', sans-serif`,
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: `'${fonts.body}', '${fonts.arabic}', sans-serif`,
      } as React.CSSProperties}
    >
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontsUrl} rel="stylesheet" />
      <style>{`
        h1, h2, h3, h4, h5, h6 {
          font-family: '${fonts.display}', '${fonts.arabic}', serif !important;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        a {
          transition: color 0.3s ease;
        }
        button {
          font-family: inherit;
        }
      `}</style>

      {/* Meta Pixel Script */}
      {metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try{
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;t.onerror=function(){};
                b.head.appendChild(t)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              }catch(e){}
            `,
          }}
        />
      )}

      <StorefrontHeader
        slug={storefront.slug}
        boutiqueName={storefront.boutiqueName}
        logoUrl={logoUrl}
        socialLinks={storefront.socialLinks}
        colors={colors}
        fonts={fonts}
      />

      <main>{children}</main>

      {/* Sophisticated Footer */}
      <footer
        className="border-t mt-0"
        style={{
          backgroundColor: colors.footerBg,
          borderColor: borderColor,
        }}
      >
        {/* Main Footer */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href={`/${storefront.slug}`} className="inline-block">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt={storefront.boutiqueName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span
                      className="text-4xl font-light tracking-[0.3em]"
                      style={{ fontFamily: `'${fonts.display}', serif`, color: colors.text }}
                    >
                      {storefront.boutiqueName.charAt(0)}
                    </span>
                  )}
                  <span
                    className="text-xs tracking-[0.4em] uppercase"
                    style={{ color: textMuted }}
                  >
                    {storefront.boutiqueName}
                  </span>
                </div>
              </Link>

              {(footerCustomText || storefront.description) && (
                <p
                  className="text-sm mt-6 max-w-sm leading-relaxed"
                  style={{ color: textMuted }}
                >
                  {footerCustomText || storefront.description}
                </p>
              )}

              {/* Social Links */}
              {storefront.socialLinks && (
                <div className="flex items-center gap-4 mt-8">
                  {storefront.socialLinks.instagram && (
                    <a
                      href={storefront.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ color: colors.accent }}
                    >
                      Instagram
                    </a>
                  )}
                  {storefront.socialLinks.facebook && (
                    <a
                      href={storefront.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ color: colors.accent }}
                    >
                      Facebook
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="text-xs tracking-[0.3em] uppercase mb-6"
                style={{ color: textMuted }}
              >
                {localText(language, { ar: 'روابط سريعة', en: 'Quick Links', fr: 'Liens rapides' })}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href={`/${storefront.slug}`}
                    className="text-sm transition-colors duration-300 hover:opacity-100"
                    style={{ color: textMuted }}
                  >
                    {localText(language, { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' })}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${storefront.slug}#products`}
                    className="text-sm transition-colors duration-300 hover:opacity-100"
                    style={{ color: textMuted }}
                  >
                    {localText(language, { ar: 'المنتجات', en: 'Products', fr: 'Produits' })}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className="text-xs tracking-[0.3em] uppercase mb-6"
                style={{ color: textMuted }}
              >
                {localText(language, { ar: 'تواصل', en: 'Contact', fr: 'Contact' })}
              </h4>
              <ul className="space-y-4">
                {storefront.socialLinks?.instagram && (
                  <li>
                    <a
                      href={storefront.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors duration-300"
                      style={{ color: textMuted }}
                    >
                      Instagram DM
                    </a>
                  </li>
                )}
                <li className="text-sm" style={{ color: textMuted }}>
                  {localText(language, { ar: 'الجزائر', en: 'Algeria', fr: 'Algerie' })}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: textSubtle }}
                >
                  &copy; {new Date().getFullYear()} {storefront.boutiqueName}
                </p>
                {footer.showPoweredBy !== false && (
                  <>
                    <span className="text-[10px]" style={{ color: textSubtle }}>|</span>
                    <a
                      href="https://ma5zani.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] tracking-[0.1em] transition-colors duration-300"
                      style={{ color: textMuted }}
                    >
                      Powered by ma5zani
                    </a>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6">
                <span
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: textSubtle }}
                >
                  {localText(language, { ar: 'التوصيل لجميع الولايات', en: 'Delivery to all wilayas', fr: 'Livraison dans toutes les wilayas' })}
                </span>
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                />
                <span
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: textSubtle }}
                >
                  {localText(language, { ar: 'الجزائر', en: 'Algeria', fr: 'Algerie' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer slug={storefront.slug} colors={colors} fonts={fonts} />

      {/* AI Chatbot Widget */}
      <ChatbotWidget
        storefrontSlug={storefront.slug}
        primaryColor={colors.primary}
      />
    </div>
  );
}
