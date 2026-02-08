'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/meta-pixel'

export default function OfferPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const whatsappMessage = encodeURIComponent(
    'السلام عليكم، أريد تفعيل متجري في ma5zani. لقد قمت بالدفع 4000 دج. إليكم إثبات الدفع:'
  )
  const whatsappLink = `https://wa.me/213658399645?text=${whatsappMessage}`

  const handleWhatsAppClick = () => {
    trackEvent('Lead', {
      content_name: 'Founder Offer 4000DA',
      content_category: 'WhatsApp Checkout',
      value: 4000,
      currency: 'DZD',
    })
  }

  const handleSignupClick = () => {
    trackEvent('ViewContent', {
      content_name: 'Founder Offer Signup',
      content_category: 'Registration',
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-[#F7941D] text-center py-3 px-4">
        <p
          className="text-white text-sm font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-cairo), var(--font-outfit), sans-serif' }}
        >
          عرض محدود — الأماكن تنفذ بسرعة
        </p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-3 text-sm"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            عرض افتتاح
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#0054A6] leading-tight mb-2"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            افتح متجرك الإلكتروني
          </h1>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#00AEEF] leading-tight"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            بـ 4,000 دج فقط / السنة
          </h2>
          <p className="text-slate-600 mt-4 text-base leading-relaxed max-w-sm mx-auto">
            متجر احترافي + مساعد ذكي AI يرد على عملائك تلقائياً — جاهز خلال 8 ساعات
          </p>
        </div>

        {/* Price Card */}
        <div className="bg-[#F7941D]/10 border-2 border-[#F7941D] rounded-2xl p-6 text-center mb-10">
          <span
            className="text-5xl font-bold text-[#F7941D]"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            4,000
          </span>
          <span className="text-xl font-bold text-[#F7941D] mr-2">دج</span>
          <p className="text-slate-500 text-sm mt-2">سنة كاملة — بدون رسوم إضافية</p>
        </div>

        {/* Features */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-10">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            ماذا تحصل عليه؟
          </h3>
          <ul className="space-y-4">
            {[
              'متجر إلكتروني احترافي برابط خاص بك',
              'إدارة المنتجات والطلبات والمخزون',
              'تحليلات المبيعات في الوقت الحقيقي',
              'مساعد ذكي AI يرد على العملاء 24/7',
              'دعم Meta Pixel للإعلانات',
              'واجهة عربية وإنجليزية',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#22B14C] font-bold text-lg leading-6">+</span>
                <span className="text-slate-600 text-[15px] leading-6">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="mb-10">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            طريقة الدفع
          </h3>

          {/* BaridiMob */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 mb-3">
            <p
              className="text-[#F7941D] font-bold text-base mb-3"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              BaridiMob
            </p>
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <span
                className="text-slate-800 text-sm tracking-wide break-all"
                dir="ltr"
                style={{ fontFamily: 'monospace' }}
              >
                00799999002364042690
              </span>
              <button
                onClick={() => copyToClipboard('00799999002364042690', 'baridimob')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  copied === 'baridimob'
                    ? 'bg-[#22B14C] text-white'
                    : 'bg-[#F7941D] text-white hover:bg-[#D35400]'
                }`}
              >
                {copied === 'baridimob' ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
          </div>

          {/* RedotPay */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
            <p
              className="text-[#F7941D] font-bold text-base mb-3"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              RedotPay
            </p>
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <span
                className="text-slate-800 text-sm tracking-wider"
                dir="ltr"
                style={{ fontFamily: 'monospace' }}
              >
                1880405318
              </span>
              <button
                onClick={() => copyToClipboard('1880405318', 'redotpay')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  copied === 'redotpay'
                    ? 'bg-[#22B14C] text-white'
                    : 'bg-[#F7941D] text-white hover:bg-[#D35400]'
                }`}
              >
                {copied === 'redotpay' ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            3 خطوات فقط
          </h3>

          <div className="space-y-4">
            {[
              { step: '1', text: 'ادفع 4,000 دج عبر BaridiMob أو RedotPay' },
              { step: '2', text: 'أرسل إثبات الدفع عبر واتساب' },
              { step: '3', text: 'متجرك يتفعّل خلال 8 ساعات' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`min-w-[40px] h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                    i === 2 ? 'bg-[#22B14C]' : 'bg-[#F7941D]'
                  }`}
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  {item.step}
                </div>
                <span className="text-slate-700 text-[15px]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-10">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="block w-full bg-[#25D366] text-white text-center py-4 rounded-xl text-lg font-bold hover:bg-[#1fb855] transition-all duration-200 shadow-lg"
            style={{ fontFamily: 'var(--font-cairo), var(--font-outfit), sans-serif' }}
          >
            أرسل إثبات الدفع عبر واتساب
          </a>
          <a
            href="/signup"
            onClick={handleSignupClick}
            className="block w-full border-2 border-[#0054A6] text-[#0054A6] text-center py-4 rounded-xl text-base font-semibold hover:bg-[#0054A6] hover:text-white transition-all duration-200"
            style={{ fontFamily: 'var(--font-cairo), var(--font-outfit), sans-serif' }}
          >
            سجّل حسابك أولاً — مجاني
          </a>
        </div>

        {/* Footer Note */}
        <div className="text-center border-t border-slate-200 pt-6">
          <p className="text-[#F7941D] text-sm font-bold mb-1">
            هذا العرض لن يتكرر — الأماكن محدودة
          </p>
          <p className="text-slate-400 text-xs">
            ma5zani.com — منصة التجارة الإلكترونية للبائعين الجزائريين
          </p>
        </div>
      </div>
    </div>
  )
}
