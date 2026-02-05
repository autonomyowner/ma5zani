'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function Stats() {
  const { t } = useLanguage()

  const stats = [
    { number: '0', label: t.stats.freeReturns, suffix: 'DZD' },
    { number: '7/7', label: t.stats.availability, suffix: '24h' },
    { number: '24-48', label: t.stats.fastDelivery, suffix: 'h' },
  ]

  return (
    <section className="py-16 bg-[#0054A6]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-5xl md:text-6xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                >
                  {stat.number}
                </span>
                {stat.suffix && (
                  <span
                    className="text-2xl font-bold text-[#00AEEF]"
                    style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="mt-2 text-white/80 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
