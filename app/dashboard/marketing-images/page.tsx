'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Card from '@/components/ui/Card';
import { localText } from '@/lib/translations';

export default function MarketingImagesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const seller = useQuery(api.sellers.getCurrentSellerProfile);

  if (seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (seller === null) {
    router.push('/onboarding');
    return null;
  }

  return (
    <DashboardLayout
      seller={seller}
      title={localText(language, {
        ar: 'صور تسويقية',
        en: 'Marketing Images',
        fr: 'Images Marketing',
      })}
    >
      <div className="max-w-2xl mx-auto py-12 lg:py-20">
        <Card className="p-8 lg:p-12 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#0054A6]/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0054A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lg:w-10 lg:h-10">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <h2
            className="text-xl lg:text-2xl font-bold text-[#0054A6] mb-3"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {localText(language, {
              ar: 'قريبا...',
              en: 'Coming Soon...',
              fr: 'Bientot...',
            })}
          </h2>
          <p className="text-sm lg:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            {localText(language, {
              ar: 'ميزة الصور التسويقية بالذكاء الاصطناعي تحت التطوير حاليا. قريبا تقدر تولّد صور احترافية لمنتجاتك بضغطة واحدة.',
              en: 'The AI marketing images feature is currently under development. Soon you will be able to generate professional product images with one click.',
              fr: 'La fonctionnalite d\'images marketing IA est en cours de developpement. Bientot vous pourrez generer des images professionnelles en un clic.',
            })}
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
