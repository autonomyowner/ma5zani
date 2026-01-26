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
}

export default function HeroSection({ content, primaryColor, accentColor }: HeroSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const subtitle = isRTL ? (content.subtitleAr || content.subtitle) : content.subtitle;
  const ctaText = isRTL ? (content.ctaTextAr || content.ctaText) : content.ctaText;
  const imageUrl = content.imageKey ? getR2PublicUrl(content.imageKey) : null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: content.backgroundColor || primaryColor,
        minHeight: imageUrl ? '400px' : '300px',
      }}
    >
      {/* Background Image */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: content.backgroundColor || primaryColor,
              opacity: 0.7,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center"
        style={{ color: content.textColor || '#ffffff' }}
      >
        {title && (
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
            {subtitle}
          </p>
        )}
        {ctaText && content.ctaLink && (
          <a
            href={content.ctaLink}
            className="inline-block px-8 py-3 rounded-xl font-semibold text-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
