'use client';

import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';

interface AboutSectionProps {
  content: {
    title?: string;
    titleAr?: string;
    subtitle?: string;
    subtitleAr?: string;
    imageKey?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  primaryColor: string;
  accentColor?: string;
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

export default function AboutSection({ content, primaryColor, accentColor = '#c9a962' }: AboutSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const text = isRTL ? (content.subtitleAr || content.subtitle) : content.subtitle;
  const imageUrl = content.imageKey ? getR2PublicUrl(content.imageKey) : null;

  const bgColor = content.backgroundColor || primaryColor;
  const isLightBg = isLightColor(bgColor);
  const textColor = content.textColor || (isLightBg ? '#1a1a1a' : '#f5f5dc');
  const textMuted = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  if (!title && !text) return null;

  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isLightBg ? '%23000000' : '%23ffffff'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-16 lg:gap-24 items-center`}>
          {/* Image Side */}
          {imageUrl && (
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title || 'About'}
                  className="w-full h-full object-cover"
                />
                {/* Floating accent element */}
                <div
                  className="absolute -bottom-4 -right-4 w-24 h-24"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
              {/* Decorative border */}
              <div
                className="absolute top-6 left-6 right-6 bottom-6 border pointer-events-none"
                style={{ borderColor }}
              />
            </div>
          )}

          {/* Content Side */}
          <div className={imageUrl ? '' : 'max-w-3xl mx-auto text-center'}>
            {/* Label */}
            <p
              className="text-xs tracking-[0.4em] uppercase mb-6"
              style={{ color: accentColor }}
            >
              {isRTL ? 'قصتنا' : 'Our Story'}
            </p>

            {/* Title */}
            {title && (
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 leading-[1.1]"
                style={{
                  color: textColor,
                  fontFamily: 'var(--font-display, serif)',
                }}
              >
                {title}
              </h2>
            )}

            {/* Decorative line */}
            <div
              className={`h-px mb-8 ${imageUrl ? '' : 'mx-auto'}`}
              style={{
                width: '60px',
                background: `linear-gradient(to right, ${accentColor}, transparent)`,
              }}
            />

            {/* Text */}
            {text && (
              <p
                className="text-base md:text-lg leading-relaxed mb-8"
                style={{
                  color: textMuted,
                  fontFamily: 'var(--font-body, sans-serif)',
                }}
              >
                {text}
              </p>
            )}

            {/* Optional: Year established or signature element */}
            <div
              className="inline-flex items-center gap-4"
              style={{ color: textMuted }}
            >
              <div className="h-px w-8" style={{ backgroundColor: borderColor }} />
              <span className="text-xs tracking-[0.3em] uppercase">
                {isRTL ? 'الجزائر' : 'Est. Algeria'}
              </span>
              <div className="h-px w-8" style={{ backgroundColor: borderColor }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
