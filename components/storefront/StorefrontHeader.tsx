'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-md' : ''
      }`}
      style={{
        backgroundColor: isScrolled ? `${colors.headerBg}f5` : 'transparent',
        borderBottom: isScrolled ? `1px solid ${borderColor}` : 'none',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Left - Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href={`/${slug}`}
              className="text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:opacity-100"
              style={{ color: textMuted }}
            >
              {isRTL ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href={`/${slug}#products`}
              className="text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:opacity-100"
              style={{ color: textMuted }}
            >
              {isRTL ? 'المنتجات' : 'Products'}
            </Link>
          </div>

          {/* Center - Logo */}
          <Link
            href={`/${slug}`}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={boutiqueName}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              />
            ) : (
              <>
                <span
                  className="text-3xl lg:text-4xl font-light tracking-[0.3em]"
                  style={{ fontFamily: `'${fonts.display}', serif`, color: textColor }}
                >
                  {boutiqueName.charAt(0)}
                </span>
                <span
                  className="text-[10px] tracking-[0.4em] uppercase mt-0.5"
                  style={{ color: textMuted }}
                >
                  {boutiqueName}
                </span>
              </>
            )}
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-6 lg:gap-10 ml-auto">
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
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-xs tracking-[0.15em] uppercase transition-colors duration-300 hover:opacity-100"
              style={{ color: textMuted }}
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative group"
              aria-label="Shopping cart"
            >
              <span
                className="text-xs tracking-[0.2em] uppercase transition-colors duration-300 group-hover:opacity-100"
                style={{ color: textMuted }}
              >
                {isRTL ? 'السلة' : 'Cart'}
              </span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-4 w-5 h-5 text-[10px] font-medium flex items-center justify-center rounded-full transition-transform"
                  style={{
                    backgroundColor: colors.accent,
                    color: isLightColor(colors.accent) ? '#000' : '#fff',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="w-5 h-px" style={{ backgroundColor: textColor }} />
              <span className="w-5 h-px" style={{ backgroundColor: textColor }} />
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${colors.headerBg}cc` }}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-[85%] max-w-sm transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : isRTL ? '-translate-x-full' : 'translate-x-full'
          }`}
          style={{ backgroundColor: colors.headerBg }}
        >
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center"
              style={{ color: textColor }}
            >
              <span className="text-2xl font-light">&times;</span>
            </button>
          </div>

          {/* Store Name */}
          <div className="px-8 mb-10 text-center">
            {logoUrl ? (
              <img src={logoUrl} alt={boutiqueName} className="w-16 h-16 rounded-full object-cover mx-auto" />
            ) : (
              <span
                className="text-4xl font-light tracking-[0.3em]"
                style={{ fontFamily: `'${fonts.display}', serif`, color: textColor }}
              >
                {boutiqueName.charAt(0)}
              </span>
            )}
            <p
              className="text-xs tracking-[0.3em] uppercase mt-3"
              style={{ color: textMuted }}
            >
              {boutiqueName}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-8 space-y-6">
            <a
              href={`/${slug}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm tracking-[0.2em] uppercase"
              style={{ color: textColor }}
            >
              {isRTL ? 'الرئيسية' : 'Home'}
            </a>
            <a
              href={`/${slug}#products`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm tracking-[0.2em] uppercase"
              style={{ color: textColor }}
            >
              {isRTL ? 'المنتجات' : 'Products'}
            </a>
          </nav>

          {/* Language Toggle */}
          <div className="px-8 mt-10">
            <button
              onClick={() => {
                setLanguage(language === 'ar' ? 'en' : 'ar');
                setIsMobileMenuOpen(false);
              }}
              className="text-sm tracking-[0.2em] uppercase px-4 py-2"
              style={{ color: textMuted, border: `1px solid ${borderColor}` }}
            >
              {language === 'ar' ? 'English' : 'عربي'}
            </button>
          </div>

          {/* Social Links */}
          {socialLinks && (
            <div className="absolute bottom-12 left-0 right-0 px-8 flex items-center gap-6">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: textMuted }}
                >
                  Instagram
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: textMuted }}
                >
                  Facebook
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok.startsWith('http') ? socialLinks.tiktok : `https://tiktok.com/@${socialLinks.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: textMuted }}
                >
                  TikTok
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
