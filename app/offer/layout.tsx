import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'عرض افتتاح — متجرك الإلكتروني بـ 4000 دج/السنة | ma5zani',
  description:
    'افتح متجرك الإلكتروني الاحترافي + مساعد ذكي AI يرد على عملائك. 4000 دج فقط للسنة كاملة. الأماكن محدودة!',
  openGraph: {
    title: 'متجرك الإلكتروني بـ 4,000 دج فقط — عرض افتتاح',
    description:
      'متجر احترافي + AI chatbot + تحليلات — جاهز خلال 8 ساعات. ادفع وأرسل الإثبات عبر واتساب.',
    url: 'https://www.ma5zani.com/offer',
    siteName: 'ma5zani',
    type: 'website',
    locale: 'ar_DZ',
  },
}

export default function OfferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
