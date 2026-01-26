'use client';

import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';

interface CollectionItem {
  title: string;
  titleAr?: string;
  imageKey?: string;
  link: string;
}

interface FeaturedCollectionProps {
  content: {
    title?: string;
    titleAr?: string;
    backgroundColor?: string;
    textColor?: string;
    items?: CollectionItem[];
  };
  primaryColor: string;
  accentColor: string;
}

export default function FeaturedCollection({ content, primaryColor, accentColor }: FeaturedCollectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const collections = content.items || [];

  if (collections.length === 0) return null;

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: content.textColor || '#1e293b' }}
          >
            {title}
          </h2>
        )}
        <div className={`grid gap-6 ${collections.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {collections.map((collection, index) => {
            const imageUrl = collection.imageKey ? getR2PublicUrl(collection.imageKey) : null;
            const collectionTitle = isRTL ? (collection.titleAr || collection.title) : collection.title;

            return (
              <a
                key={index}
                href={collection.link}
                className="relative group block overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: primaryColor,
                  minHeight: '200px',
                }}
              >
                {imageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${primaryColor}cc, ${primaryColor}33)`,
                      }}
                    />
                  </div>
                )}
                <div className="relative p-6 flex flex-col justify-end h-full min-h-[200px]">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {collectionTitle}
                  </h3>
                  <span
                    className="inline-block px-4 py-2 rounded-lg text-sm font-medium w-fit transition-colors"
                    style={{
                      backgroundColor: accentColor,
                      color: '#ffffff',
                    }}
                  >
                    {isRTL ? 'تسوق الآن' : 'Shop Now'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
