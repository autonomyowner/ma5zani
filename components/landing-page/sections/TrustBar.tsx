'use client'

import { localText, Language } from '@/lib/translations'

interface TrustBarProps {
  language: Language
  accentColor: string
  primaryColor: string
  isDark?: boolean
}

export default function TrustBar({ language, accentColor, primaryColor, isDark }: TrustBarProps) {
  const items = [
    localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }),
    localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' }),
    localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' }),
  ]

  return (
    <section
      className="py-5"
      style={{
        backgroundColor: isDark ? '#ffffff08' : primaryColor + '06',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {items.map((text, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
