'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function HowItWorks() {
  const { t, dir } = useLanguage()

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.howItWorks.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.howItWorks.sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t.howItWorks.sectionDesc}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div
            className="hidden lg:block absolute top-24 h-0.5 bg-gradient-to-r from-[#00AEEF] via-[#F7941D] to-[#22B14C]"
            style={{
              left: dir === 'rtl' ? 'calc(12.5% + 2rem)' : 'calc(12.5% + 2rem)',
              right: dir === 'rtl' ? 'calc(12.5% + 2rem)' : 'calc(12.5% + 2rem)',
            }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Number Circle */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-[#00AEEF] mb-6 shadow-lg">
                  <span
                    className="text-3xl font-bold text-[#0054A6]"
                    style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold text-[#0054A6] mb-3"
                  style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
