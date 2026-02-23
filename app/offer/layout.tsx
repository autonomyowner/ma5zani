import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'عرض مدى الحياة — متجرك الإلكتروني بـ 4000 دج | ma5zani',
  description:
    'افتح متجرك الإلكتروني الاحترافي + مساعد ذكي AI يرد على عملائك. 4000 دج فقط مدى الحياة. الأماكن محدودة!',
  openGraph: {
    title: 'متجرك الإلكتروني بـ 4,000 دج فقط — عرض مدى الحياة',
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
  return <Suspense>{children}</Suspense>
}
