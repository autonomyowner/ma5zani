'use client';

import { useLanguage } from '@/lib/LanguageContext';

interface AnnouncementBarProps {
  content: {
    title?: string;
    titleAr?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  primaryColor: string;
}

export default function AnnouncementBar({ content, primaryColor }: AnnouncementBarProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const text = isRTL ? (content.titleAr || content.title) : content.title;

  if (!text) return null;

  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm font-medium"
      style={{
        backgroundColor: content.backgroundColor || primaryColor,
        color: content.textColor || '#ffffff',
      }}
    >
      {text}
    </div>
  );
}
