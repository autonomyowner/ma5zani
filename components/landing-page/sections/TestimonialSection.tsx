'use client'

import { useScrollReveal } from '../useScrollReveal'

interface TestimonialSectionProps {
  testimonial: { text: string; author: string; location: string }
  primaryColor: string
  accentColor: string
  isDark?: boolean
}

export default function TestimonialSection({ testimonial, primaryColor, accentColor, isDark }: TestimonialSectionProps) {
  const reveal = useScrollReveal()

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`rounded-2xl p-8 sm:p-10 transition-all duration-700 ${
            reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            backgroundColor: isDark ? '#1a1a1a' : primaryColor + '06',
            border: `1px solid ${isDark ? '#ffffff10' : primaryColor + '12'}`,
          }}
        >
          {/* Quote mark */}
          <div
            className="text-5xl sm:text-6xl font-serif leading-none mb-4"
            style={{ color: accentColor, opacity: 0.4 }}
          >
            &ldquo;
          </div>

          <p
            className="text-lg sm:text-xl leading-relaxed mb-6"
            style={{ opacity: 0.85 }}
          >
            {testimonial.text}
          </p>

          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              {testimonial.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: primaryColor }}>
                {testimonial.author}
              </p>
              <p className="text-xs" style={{ opacity: 0.5 }}>
                {testimonial.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
