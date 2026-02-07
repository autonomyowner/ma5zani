'use client';

import { useLanguage } from '@/lib/LanguageContext';

interface FeatureItem {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
}

interface FeaturesBannerProps {
  content: {
    title?: string;
    titleAr?: string;
    backgroundColor?: string;
    textColor?: string;
    items?: FeatureItem[];
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

// Default features using BOLD TYPOGRAPHY (numbers, single words) - no icons
const defaultFeatures: FeatureItem[] = [
  {
    title: '24H',
    titleAr: '24 ساعة',
    description: 'Fast delivery',
    descriptionAr: 'توصيل سريع',
  },
  {
    title: 'COD',
    titleAr: 'الدفع',
    description: 'Pay on delivery',
    descriptionAr: 'عند الاستلام',
  },
  {
    title: '58',
    titleAr: '58',
    description: 'Wilayas covered',
    descriptionAr: 'ولاية مغطاة',
  },
  {
    title: '100%',
    titleAr: '100%',
    description: 'Authentic products',
    descriptionAr: 'منتجات أصلية',
  },
];

export default function FeaturesBanner({ content, primaryColor, accentColor = '#c9a962' }: FeaturesBannerProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const features = content.items?.length ? content.items : defaultFeatures;
  const title = isRTL ? (content.titleAr || content.title) : content.title;

  const bgColor = content.backgroundColor || primaryColor;
  const isLightBg = isLightColor(bgColor);
  const textColor = content.textColor || (isLightBg ? '#1a1a1a' : '#f5f5dc');
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <section
      className="relative py-20 lg:py-24 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Title */}
        {title && (
          <div className="text-center mb-16">
            <p
              className="text-xs tracking-[0.4em] uppercase mb-4"
              style={{ color: accentColor }}
            >
              {isRTL ? 'لماذا نحن' : 'Why Choose Us'}
            </p>
            <h2
              className="text-3xl md:text-4xl font-light"
              style={{
                color: textColor,
                fontFamily: 'var(--font-display, serif)',
              }}
            >
              {title}
            </h2>
            <div
              className="h-px mx-auto mt-8"
              style={{
                width: '60px',
                background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
              }}
            />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {features.map((feature, index) => {
            const featureTitle = isRTL ? (feature.titleAr || feature.title) : feature.title;
            const featureDescription = isRTL
              ? (feature.descriptionAr || feature.description)
              : feature.description;

            return (
              <div
                key={index}
                className="relative text-center p-8 lg:p-10 group"
              >
                {/* Decorative borders between items (desktop) */}
                {index < features.length - 1 && (
                  <div
                    className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px"
                    style={{ backgroundColor: borderColor }}
                  />
                )}

                {/* Bold Typography Title - The main visual element */}
                <div
                  className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 transition-colors duration-300"
                  style={{
                    color: accentColor,
                    fontFamily: 'var(--font-display, serif)',
                  }}
                >
                  {featureTitle}
                </div>

                {/* Description - Smaller, supporting text */}
                <p
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{
                    color: textMuted,
                    fontFamily: 'var(--font-body, sans-serif)',
                  }}
                >
                  {featureDescription}
                </p>

                {/* Hover accent line */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-8 transition-all duration-300"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
