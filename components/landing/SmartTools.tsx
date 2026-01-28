'use client'

import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

export default function SmartTools() {
  const { t } = useLanguage()

  return (
    <section id="smart-tools" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.smartTools.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.smartTools.sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t.smartTools.sectionDesc}
          </p>
        </div>

        {/* Two-column cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Landing Pages Card */}
          <Card variant="bordered" hover className="flex flex-col">
            <div className="space-y-4">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00AEEF]/10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AEEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold text-[#0054A6]"
                style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
              >
                {t.smartTools.landingPages.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t.smartTools.landingPages.description}
              </p>
              <ul className="space-y-3 pt-2">
                {t.smartTools.landingPages.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#22B14C]/10 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#22B14C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Bot Integration Card */}
          <Card variant="bordered" hover className="flex flex-col">
            <div className="space-y-4">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F7941D]/10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F7941D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect x="2" y="8" width="20" height="14" rx="2" />
                  <path d="M6 12h.01" />
                  <path d="M18 12h.01" />
                  <path d="M9 16c.6.9 1.6 1.5 3 1.5s2.4-.6 3-1.5" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold text-[#0054A6]"
                style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
              >
                {t.smartTools.botIntegration.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t.smartTools.botIntegration.description}
              </p>
              <ul className="space-y-3 pt-2">
                {t.smartTools.botIntegration.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#22B14C]/10 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#22B14C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
