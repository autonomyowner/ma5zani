'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';

interface NewsletterSectionProps {
  content: {
    title?: string;
    titleAr?: string;
    subtitle?: string;
    subtitleAr?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  primaryColor: string;
  accentColor: string;
}

export default function NewsletterSection({ content, primaryColor, accentColor }: NewsletterSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const title = language === 'ar'
    ? (content.titleAr || content.title || 'اشترك في النشرة البريدية')
    : language === 'fr'
    ? (content.title || 'Abonnez-vous a notre newsletter')
    : (content.title || 'Subscribe to our newsletter');

  const subtitle = language === 'ar'
    ? (content.subtitleAr || content.subtitle || 'احصل على آخر العروض والتحديثات')
    : language === 'fr'
    ? (content.subtitle || 'Recevez les dernieres offres et mises a jour')
    : (content.subtitle || 'Get the latest deals and updates');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, you'd send this to your backend
      console.log('Newsletter signup:', email);
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || primaryColor,
      }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: content.textColor || '#ffffff' }}
        >
          {title}
        </h2>
        <p
          className="mb-6 opacity-90"
          style={{ color: content.textColor || '#ffffff' }}
        >
          {subtitle}
        </p>

        {submitted ? (
          <div
            className="py-4 px-6 rounded-xl inline-block"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <p style={{ color: content.textColor || '#ffffff' }}>
              {localText(language, { ar: 'شكراً لاشتراكك!', en: 'Thanks for subscribing!', fr: 'Merci pour votre inscription !' })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={localText(language, { ar: 'بريدك الإلكتروني', en: 'Your email address', fr: 'Votre adresse email' })}
              className="px-4 py-3 rounded-xl text-slate-900 w-full sm:w-72 outline-none focus:ring-2"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-105"
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
              }}
            >
              {localText(language, { ar: 'اشترك', en: 'Subscribe', fr: 'S\'abonner' })}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
