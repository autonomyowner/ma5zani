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
}

export default function AboutSection({ content, primaryColor }: AboutSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const text = isRTL ? (content.subtitleAr || content.subtitle) : content.subtitle;
  const imageUrl = content.imageKey ? getR2PublicUrl(content.imageKey) : null;

  if (!title && !text) return null;

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${imageUrl ? 'md:flex-row' : ''} gap-8 items-center`}>
          {imageUrl && (
            <div className="w-full md:w-1/2">
              <img
                src={imageUrl}
                alt={title || 'About'}
                className="w-full rounded-2xl object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
          <div className={`${imageUrl ? 'w-full md:w-1/2' : 'max-w-3xl mx-auto text-center'}`}>
            {title && (
              <h2
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ color: content.textColor || primaryColor }}
              >
                {title}
              </h2>
            )}
            {text && (
              <p
                className="text-lg leading-relaxed"
                style={{ color: content.textColor || '#64748b' }}
              >
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
