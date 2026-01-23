'use client'

import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

export default function Features() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.features.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.features.sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t.features.sectionDesc}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((feature, index) => (
            <Card
              key={index}
              variant="bordered"
              hover
              className="group"
            >
              <div className="space-y-4">
                <span
                  className="text-5xl font-bold text-[#00AEEF]/20 group-hover:text-[#00AEEF]/40 transition-colors"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  {feature.number}
                </span>
                <h3
                  className="text-xl font-bold text-[#0054A6]"
                  style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
