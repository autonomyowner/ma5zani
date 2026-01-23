'use client'

import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

export default function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.testimonials.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.testimonials.sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t.testimonials.sectionDesc}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {t.testimonials.items.map((testimonial, index) => (
            <Card key={index} variant="bordered" className="flex flex-col">
              {/* Quote */}
              <div className="flex-1">
                <span
                  className="text-6xl text-[#00AEEF]/20 leading-none"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  "
                </span>
                <p className="text-slate-600 -mt-4">
                  {testimonial.quote}
                </p>
              </div>

              {/* Author */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-bold text-[#0054A6]"
                      style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                    >
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500">{testimonial.business}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-lg font-bold text-[#22B14C]"
                      style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                    >
                      {testimonial.metric}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
