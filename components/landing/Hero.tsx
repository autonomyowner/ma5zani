'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/lib/LanguageContext'
import { authClient } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export default function Hero() {
  const { t, dir, language } = useLanguage()
  const { data: session } = authClient.useSession()
  const isSignedIn = !!session
  const [visibleWords, setVisibleWords] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleWords(1), 300),
      setTimeout(() => setVisibleWords(2), 700),
      setTimeout(() => setVisibleWords(3), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        {/* Large circle */}
        <div className={`absolute -top-40 w-[600px] h-[600px] rounded-full bg-[#00AEEF]/5 ${dir === 'rtl' ? '-left-40' : '-right-40'}`} />
        {/* Small circle */}
        <div className={`absolute top-1/2 w-[300px] h-[300px] rounded-full bg-[#F7941D]/5 ${dir === 'rtl' ? '-right-20' : '-left-20'}`} />
        {/* Grid pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0054A6 1px, transparent 1px),
              linear-gradient(to bottom, #0054A6 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={`space-y-8 ${dir === 'rtl' ? 'lg:order-1' : ''}`}>
            <div className="space-y-4">
              <p
                className="text-[#F7941D] font-semibold tracking-wide uppercase opacity-0 animate-fade-in-up"
                style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
              >
                {t.hero.tagline}
              </p>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0054A6] leading-tight"
                style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
              >
                <span
                  className="inline-block transition-all duration-700 ease-out"
                  style={{
                    opacity: visibleWords >= 1 ? 1 : 0,
                    transform: visibleWords >= 1 ? 'translateY(0)' : 'translateY(30px)',
                  }}
                >
                  {t.hero.title1}
                </span>
                <br />
                <span
                  className="inline-block text-[#00AEEF] transition-all duration-700 ease-out"
                  style={{
                    opacity: visibleWords >= 2 ? 1 : 0,
                    transform: visibleWords >= 2 ? 'translateY(0)' : 'translateY(30px)',
                  }}
                >
                  {t.hero.title2}
                </span>
                <br />
                <span
                  className="inline-block transition-all duration-700 ease-out"
                  style={{
                    opacity: visibleWords >= 3 ? 1 : 0,
                    transform: visibleWords >= 3 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  }}
                >
                  {t.hero.title3}
                </span>
              </h1>
              <p className={`text-xl text-slate-600 opacity-0 animate-fade-in-up stagger-2 ${dir === 'rtl' ? 'max-w-xl' : 'max-w-lg'}`}>
                {t.hero.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up stagger-3">
              <Link href={isSignedIn ? "/dashboard" : "/signup"}>
                <Button variant="primary" size="lg">
                  {isSignedIn ? t.nav.dashboard : t.hero.startTrial}
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg">
                  {t.hero.seeHow}
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 opacity-0 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#22B14C]" style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}>100%</span>
                <span className="text-slate-600 text-sm">{t.hero.trustBadge}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={`relative hidden lg:flex items-center justify-center ${dir === 'rtl' ? 'lg:order-2' : ''}`}>
            <div className="relative w-full max-w-3xl animate-float" style={{ transform: 'scale(2.2)' }}>
              <img
                src="/hero2shape.svg"
                alt="ma5zani - E-commerce Fulfillment"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
