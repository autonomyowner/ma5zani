'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { localText, Language } from '@/lib/translations';

interface StorefrontHeaderProps {
  slug: string;
  boutiqueName: string;
  logoUrl: string | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    footerBg: string;
  };
  fonts: {
    display: string;
    body: string;
    arabic: string;
  };
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

export default function StorefrontHeader({
  slug,
  boutiqueName,
  logoUrl,
  socialLinks,
  colors,
  fonts,
}: StorefrontHeaderProps) {
  const { totalItems, openCart } = useCart();
  const { language, setLanguage } = useLanguage();
  const isRTL = language === 'ar';
  const [isScrolled, setIsScrolled] = useState(false);
  const isLightHeader = isLightColor(colors.headerBg);
  const textColor = isLightHeader ? colors.primary : colors.text;
  const textMuted = isLightHeader ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
  const borderColor = isLightHeader ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-md' : ''
      }`}
      style={{
        backgroundColor: isScrolled ? `${colors.headerBg}f5` : colors.headerBg,
        borderBottom: isScrolled ? `1px solid ${borderColor}` : 'none',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between h-14 md:h-20 lg:h-24">
          {/* Left - Navigation */}
          <div className="flex items-center gap-4 md:gap-10 relative z-10">
            <Link
              href={`/${slug}`}
              className="transition-colors duration-300 hover:opacity-100 flex items-center gap-1.5"
              style={{ color: textMuted }}
              aria-label="Home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:hidden"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
              <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">{localText(language, { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' })}</span>
            </Link>
            <Link
              href={`/${slug}#products`}
              className="transition-colors duration-300 hover:opacity-100 flex items-center gap-1.5"
              style={{ color: textMuted }}
              aria-label="Products"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:hidden"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">{localText(language, { ar: 'المنتجات', en: 'Products', fr: 'Produits' })}</span>
            </Link>
          </div>

          {/* Center - Store Name / Logo */}
          <Link
            href={`/${slug}`}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={boutiqueName}
                width={48}
                height={48}
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              />
            ) : (
              <span
                className="text-base md:text-lg lg:text-xl font-medium tracking-[0.15em] truncate max-w-[120px] sm:max-w-[180px] md:max-w-none"
                style={{ fontFamily: `'${fonts.display}', serif`, color: textColor }}
              >
                {boutiqueName}
              </span>
            )}
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-3 md:gap-6 lg:gap-10 ms-auto relative z-10">
            {/* Social Links (Desktop) */}
            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ color: textMuted }}
              >
                Instagram
              </a>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => {
                const cycle: Record<Language, Language> = { ar: 'en', en: 'fr', fr: 'ar' };
                setLanguage(cycle[language]);
              }}
              className="text-[11px] md:text-xs tracking-[0.1em] md:tracking-[0.15em] uppercase transition-colors duration-300 hover:opacity-100 whitespace-nowrap flex-shrink-0"
              style={{ color: textMuted }}
            >
              {localText(language, { ar: 'EN', en: 'FR', fr: 'AR' })}
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative group flex-shrink-0"
              aria-label="Shopping cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:hidden" style={{ color: textMuted }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span
                className="hidden md:inline text-xs tracking-[0.2em] uppercase transition-colors duration-300 group-hover:opacity-100"
                style={{ color: textMuted }}
              >
                {localText(language, { ar: 'السلة', en: 'Cart', fr: 'Panier' })}
              </span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-3 md:-right-4 w-4 h-4 md:w-5 md:h-5 text-[9px] md:text-[10px] font-medium flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors.accent,
                    color: isLightColor(colors.accent) ? '#000' : '#fff',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
