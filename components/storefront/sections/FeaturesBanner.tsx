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
}

const defaultFeatures: FeatureItem[] = [
  {
    title: 'Free Shipping',
    titleAr: 'شحن مجاني',
    description: 'On all orders',
    descriptionAr: 'على جميع الطلبات',
  },
  {
    title: 'Secure Payment',
    titleAr: 'دفع آمن',
    description: 'Cash on delivery',
    descriptionAr: 'الدفع عند الاستلام',
  },
  {
    title: '24/7 Support',
    titleAr: 'دعم متواصل',
    description: 'We\'re here to help',
    descriptionAr: 'نحن هنا لمساعدتك',
  },
  {
    title: 'Easy Returns',
    titleAr: 'إرجاع سهل',
    description: 'Hassle-free returns',
    descriptionAr: 'إرجاع بدون متاعب',
  },
];

export default function FeaturesBanner({ content, primaryColor }: FeaturesBannerProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const features = content.items?.length ? content.items : defaultFeatures;
  const title = isRTL ? (content.titleAr || content.title) : content.title;

  return (
    <section
      className="py-10 px-4"
      style={{
        backgroundColor: content.backgroundColor || '#f8fafc',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: content.textColor || '#1e293b' }}
          >
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-4"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <h3
                className="font-semibold mb-1"
                style={{ color: content.textColor || '#1e293b' }}
              >
                {isRTL ? (feature.titleAr || feature.title) : feature.title}
              </h3>
              <p
                className="text-sm opacity-70"
                style={{ color: content.textColor || '#64748b' }}
              >
                {isRTL ? (feature.descriptionAr || feature.description) : feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
