'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

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

  const title = isRTL
    ? (content.titleAr || content.title || 'اشترك في النشرة البريدية')
    : (content.title || 'Subscribe to our newsletter');

  const subtitle = isRTL
    ? (content.subtitleAr || content.subtitle || 'احصل على آخر العروض والتحديثات')
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
              {isRTL ? 'شكراً لاشتراكك!' : 'Thanks for subscribing!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email address'}
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
              {isRTL ? 'اشترك' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
