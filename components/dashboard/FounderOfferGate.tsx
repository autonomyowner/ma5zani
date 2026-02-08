'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function FounderOfferGate() {
  const { language, t } = useLanguage()
  const isRTL = language === 'ar'
  const fo = t.founderOffer

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border-2 border-[#F7941D] p-6 sm:p-8 text-center">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 bg-[#F7941D]/10 text-[#F7941D] rounded-full text-sm font-bold mb-4">
          {fo.title}
        </span>

        {/* Main offer */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
          {fo.specialOffer}
        </h2>
        <p className="text-slate-600 mb-6">{fo.subtitle}</p>

        {/* Features */}
        <div className={`text-${isRTL ? 'right' : 'left'} bg-slate-50 rounded-xl p-4 sm:p-6 mb-6`}>
          <ul className="space-y-3">
            {fo.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#22B14C] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  &#10003;
                </span>
                <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment */}
        <div className="bg-[#0054A6]/5 rounded-xl p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-[#0054A6] mb-2">{fo.paymentTitle}</h3>
          <p className="text-slate-700 font-medium mb-3">{fo.paymentMethod}</p>
          <p className="text-slate-600 text-sm mb-1">{fo.sendProof}</p>
          <a
            href={`https://wa.me/213658399645`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-3 bg-[#22B14C] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            WhatsApp: {fo.whatsappNumber}
          </a>
        </div>

        {/* Scarcity */}
        <p className="text-[#F7941D] font-bold text-sm">
          {fo.limitedSpots}
        </p>
      </div>
    </div>
  )
}
