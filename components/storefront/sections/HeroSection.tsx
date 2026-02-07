'use client';

import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';

interface HeroSectionProps {
  content: {
    title?: string;
    titleAr?: string;
    subtitle?: string;
    subtitleAr?: string;
    imageKey?: string;
    backgroundColor?: string;
    textColor?: string;
    ctaText?: string;
    ctaTextAr?: string;
    ctaLink?: string;
  };
  primaryColor: string;
  accentColor: string;
  fonts?: {
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

export default function HeroSection({ content, primaryColor, accentColor, fonts }: HeroSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const subtitle = isRTL ? (content.subtitleAr || content.subtitle) : content.subtitle;
  const ctaText = isRTL ? (content.ctaTextAr || content.ctaText) : content.ctaText;
  const imageUrl = content.imageKey ? getR2PublicUrl(content.imageKey) : null;

  const bgColor = content.backgroundColor || primaryColor;
  const textColor = content.textColor || (isLightColor(bgColor) ? '#1a1a1a' : '#f5f5dc');
  const textMuted = isLightColor(bgColor) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';

  // Split title for styling (if contains line break or is long)
  const titleParts = title?.split('\n') || [title];
  const hasMultipleParts = titleParts.length > 1;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Image with Overlay */}
      {imageUrl && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 transition-transform duration-[1.5s]"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Gradient Overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${bgColor} 0%, transparent 30%, transparent 70%, ${bgColor} 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${bgColor}cc 0%, transparent 50%, ${bgColor}cc 100%)`,
            }}
          />
        </div>
      )}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
        {/* Top decorative line */}
        <div
          className="h-px mx-auto mb-12 transition-all duration-1000"
          style={{
            width: '100px',
            background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          }}
        />

        {/* Subtitle / Tagline */}
        {subtitle && !hasMultipleParts && (
          <p
            className="text-xs tracking-[0.5em] uppercase mb-6"
            style={{ color: accentColor }}
          >
            {isRTL ? 'اكتشف التميز' : 'Discover Excellence'}
          </p>
        )}

        {/* Main Title */}
        {title && (
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-[0.9]"
            style={{
              fontFamily: fonts ? `'${fonts.display}', serif` : 'inherit',
              color: textColor,
            }}
          >
            {hasMultipleParts ? (
              <>
                {titleParts[0]}
                <br />
                <span className="italic" style={{ color: accentColor }}>
                  {titleParts[1]}
                </span>
              </>
            ) : (
              title
            )}
          </h1>
        )}

        {/* Description */}
        {subtitle && (
          <p
            className="text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
            style={{
              fontFamily: fonts ? `'${fonts.body}', sans-serif` : 'inherit',
              color: textMuted,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* CTA Buttons */}
        {ctaText && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={content.ctaLink || '#products'}
              className="px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: accentColor,
                color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
                boxShadow: `0 4px 24px ${accentColor}40`,
              }}
            >
              {ctaText}
            </a>
            <a
              href="#about"
              className="px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${textMuted}`,
                color: textColor,
              }}
            >
              {isRTL ? 'قصتنا' : 'Our Story'}
            </a>
          </div>
        )}

        {/* Bottom decorative line */}
        <div
          className="h-px mx-auto mt-16 transition-all duration-1000"
          style={{
            width: '100px',
            background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: textMuted }}
          >
            {isRTL ? 'تصفح' : 'Scroll'}
          </span>
          <div
            className="w-px h-10"
            style={{
              background: `linear-gradient(to bottom, ${textMuted}, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Side Text (Desktop) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
        <span
          className="text-[10px] tracking-[0.5em] uppercase -rotate-90 block origin-center whitespace-nowrap"
          style={{ color: textMuted }}
        >
          {isRTL ? 'منتجات مميزة' : 'Premium Products'}
        </span>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
        <span
          className="text-[10px] tracking-[0.5em] uppercase rotate-90 block origin-center whitespace-nowrap"
          style={{ color: textMuted }}
        >
          {isRTL ? 'الجزائر' : 'Algeria'}
        </span>
      </div>
    </section>
  );
}
