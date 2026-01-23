'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/lib/LanguageContext'

export default function CTA() {
  const { t } = useLanguage()

  return (
    <section className="py-24 bg-[#0054A6] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#00AEEF]/10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#F7941D]/10" />
        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              white 0px,
              white 1px,
              transparent 1px,
              transparent 60px
            )`
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
        >
          {t.cta.title}
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {t.cta.description}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-[#F7941D] hover:bg-[#D35400] text-white"
            >
              {t.cta.startTrial}
            </Button>
          </Link>
          <Link href="#pricing">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#0054A6]"
            >
              {t.cta.viewPricing}
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-white/60 text-sm">
          {t.cta.trialInfo}
        </p>
      </div>
    </section>
  )
}
