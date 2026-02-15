'use client'

import { useLanguage } from '@/lib/LanguageContext'

const monthlyPlans = [
  { nameAr: 'أساسي', nameEn: 'Starter', nameFr: 'Starter', price: '1,000' },
  { nameAr: 'متقدم', nameEn: 'Pro', nameFr: 'Pro', price: '3,900' },
  { nameAr: 'بزنس', nameEn: 'Business', nameFr: 'Business', price: '7,900' },
]

export default function FounderOfferGate() {
  const { language, t } = useLanguage()
  const isRTL = language === 'ar'
  const fo = t.founderOffer
  const tr = t.trial

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border-2 border-[#F7941D] p-6 sm:p-8 text-center">
        {/* Trial expired heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
          {tr.trialExpired}
        </h2>
        <p className="text-slate-600 mb-6">{tr.trialExpiredSubtitle}</p>

        {/* Founder Offer — Best Deal */}
        <div className="bg-[#F7941D]/10 border-2 border-[#F7941D] rounded-xl p-4 sm:p-6 mb-6">
          <span className="inline-block px-3 py-1 bg-[#F7941D] text-white rounded-full text-xs font-bold mb-3">
            {tr.yearlyDeal}
          </span>
          <h3 className="text-xl font-bold text-[#F7941D] mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
            {fo.specialOffer}
          </h3>
          <p className="text-slate-600 text-sm mb-3">{fo.subtitle}</p>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }} className="bg-white rounded-lg p-3 mb-3">
            <ul className="space-y-2">
              {fo.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#22B14C] text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    &#10003;
                  </span>
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Monthly Plans */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-700 mb-3">{tr.monthlyPlans}</h3>
          <div className="grid grid-cols-3 gap-3">
            {monthlyPlans.map((plan, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="font-bold text-[#0054A6] text-sm">
                  {language === 'ar' ? plan.nameAr : language === 'fr' ? plan.nameFr : plan.nameEn}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {plan.price}
                  <span className="text-xs text-slate-500 font-normal"> {language === 'ar' ? 'دج' : 'DZD'}{tr.perMonth}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-[#0054A6]/5 rounded-xl p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-[#0054A6] mb-2">{fo.paymentTitle}</h3>
          <p className="text-slate-700 font-medium mb-3">{fo.paymentMethod}</p>
          <p className="text-slate-600 text-sm mb-1">{fo.sendProof}</p>
          <a
            href={`https://wa.me/213697339450`}
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
