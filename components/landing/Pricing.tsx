'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

export default function Pricing() {
  const { t, language } = useLanguage()

  const popularIndex = 1 // Plus plan is most popular

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.pricing.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.pricing.sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t.pricing.sectionDesc}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {t.pricing.plans.map((plan, index) => {
            const isPopular = index === popularIndex
            return (
              <Card
                key={index}
                variant={isPopular ? 'elevated' : 'bordered'}
                className={`relative ${isPopular ? 'border-2 border-[#F7941D] scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className="bg-[#F7941D] text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                    >
                      {t.pricing.mostPopular}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3
                    className="text-2xl font-bold text-[#0054A6] mb-2"
                    style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className="text-4xl font-bold text-slate-900"
                      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-slate-600">
                      {language === 'ar' ? 'دج' : 'DZD'}{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="text-[#22B14C] font-bold">+</span>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    variant={isPopular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {t.pricing.getStarted}
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>

        {/* Founder Offer Banner */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-[#F7941D]/10 border-2 border-[#F7941D] rounded-2xl text-center">
          <p
            className="text-2xl font-bold text-[#F7941D] mb-2"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {language === 'ar'
              ? 'عرض المؤسسين: 4,000 دج/السنة — لأول 50 بائع'
              : language === 'fr'
                ? 'Offre Fondateur : 4 000 DA/an — pour les 50 premiers'
                : 'Founder Offer: 4,000 DA/year — first 50 sellers'}
          </p>
          <p className="text-slate-600">
            {language === 'ar'
              ? 'كل المميزات مفتوحة بأقل سعر — منتجات بلا حدود، مساعد ذكي، قوالب احترافية. عرض لن يتكرر!'
              : language === 'fr'
                ? 'Toutes les fonctionnalites au meilleur prix — produits illimites, chatbot IA, templates pro. Offre limitee !'
                : 'All features unlocked at the lowest price — unlimited products, AI chatbot, pro templates. This offer won\'t last!'}
          </p>
          <Link href="/offer">
            <Button variant="primary" size="lg" className="mt-4">
              {language === 'ar' ? 'احجز مكانك' : language === 'fr' ? 'Reservez votre place' : 'Claim Your Spot'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
