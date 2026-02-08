import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Cairo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1343395010814971'

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
      <body style={{ fontFamily: 'var(--font-cairo), var(--font-plus-jakarta), sans-serif' }}>
        <Script
          id="meta-pixel-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbq||(function(){var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!window._fbq)window._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[]})();
              fbq("init","${META_PIXEL_ID}");
              fbq("track","PageView");
            `,
          }}
        />
        <Script
          id="meta-pixel-sdk"
          strategy="afterInteractive"
          src="https://connect.facebook.net/en_US/fbevents.js"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
