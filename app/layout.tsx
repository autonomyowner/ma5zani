import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Cairo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import { MetaPixel } from '@/components/MetaPixel'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'مخزني - ma5zani | حلول التوصيل للتجارة الإلكترونية في الجزائر',
  description: 'الحل الذكي للتخزين والتوصيل لبائعي التجارة الإلكترونية الجزائريين. خزّن، وصّل، ووسّع بسهولة.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${outfit.variable} ${plusJakartaSans.variable} ${cairo.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CY1K7LJBPB"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CY1K7LJBPB');
          `}
        </Script>
      </head>
      <body style={{ fontFamily: 'var(--font-cairo), var(--font-plus-jakarta), sans-serif' }}>
        <MetaPixel />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
