'use client'

import { useState, useEffect } from 'react'
import { trackEvent } from '@/lib/meta-pixel'

type Lang = 'ar' | 'fr'

const t = {
  ar: {
    topBanner: 'عرض محدود — الأماكن تنفذ بسرعة',
    countdownTitle: 'ينتهي العرض خلال',
    day: 'يوم',
    hour: 'ساعة',
    minute: 'دقيقة',
    second: 'ثانية',
    badge: 'عرض افتتاح',
    heroTitle: 'افتح متجرك الإلكتروني',
    heroPrice: 'بـ 4,000 دج فقط / السنة',
    heroDesc: 'متجر احترافي + مساعد ذكي AI يرد على عملائك تلقائياً — جاهز خلال 8 ساعات',
    priceAmount: '4,000',
    priceCurrency: 'دج',
    priceNote: 'سنة كاملة — بدون رسوم إضافية',
    featuresTitle: 'ماذا تحصل عليه؟',
    features: [
      'متجر إلكتروني احترافي برابط خاص بك',
      'إدارة المنتجات والطلبات والمخزون',
      'تحليلات المبيعات في الوقت الحقيقي',
      'مساعد ذكي AI يرد على العملاء 24/7',
      'دعم Meta Pixel للإعلانات',
      'واجهة عربية وفرنسية',
    ],
    paymentTitle: 'طريقة الدفع',
    copied: 'تم النسخ',
    copy: 'نسخ',
    stepsTitle: '3 خطوات فقط',
    steps: [
      'ادفع 4,000 دج عبر BaridiMob أو RedotPay',
      'أرسل إثبات الدفع عبر واتساب',
      'متجرك يتفعّل خلال 8 ساعات',
    ],
    ctaWhatsapp: 'أرسل إثبات الدفع عبر واتساب',
    ctaSignup: 'سجّل حسابك أولاً — مجاني',
    footerUrgency: 'هذا العرض لن يتكرر — الأماكن محدودة',
    footerTag: 'ma5zani.com — منصة التجارة الإلكترونية للبائعين الجزائريين',
    whatsappMessage: 'السلام عليكم، أريد تفعيل متجري في ma5zani. لقد قمت بالدفع 4000 دج. إليكم إثبات الدفع:',
  },
  fr: {
    topBanner: 'Offre limitée — Les places partent vite',
    countdownTitle: "L'offre expire dans",
    day: 'jour',
    hour: 'heure',
    minute: 'minute',
    second: 'seconde',
    badge: "Offre de lancement",
    heroTitle: 'Ouvrez votre boutique en ligne',
    heroPrice: 'pour seulement 4 000 DA / an',
    heroDesc: 'Boutique professionnelle + assistant IA qui répond à vos clients automatiquement — prêt en 8 heures',
    priceAmount: '4 000',
    priceCurrency: 'DA',
    priceNote: "Une année complète — sans frais supplémentaires",
    featuresTitle: "Qu'est-ce que vous obtenez ?",
    features: [
      'Boutique en ligne professionnelle avec votre propre lien',
      'Gestion des produits, commandes et stocks',
      'Analyses des ventes en temps réel',
      'Assistant IA qui répond aux clients 24/7',
      'Support Meta Pixel pour les publicités',
      'Interface en arabe et en français',
    ],
    paymentTitle: 'Méthode de paiement',
    copied: 'Copié',
    copy: 'Copier',
    stepsTitle: '3 étapes seulement',
    steps: [
      'Payez 4 000 DA via BaridiMob ou RedotPay',
      "Envoyez la preuve de paiement via WhatsApp",
      'Votre boutique est activée en 8 heures',
    ],
    ctaWhatsapp: 'Envoyer la preuve de paiement via WhatsApp',
    ctaSignup: "Créez votre compte d'abord — gratuit",
    footerUrgency: "Cette offre ne se répétera pas — places limitées",
    footerTag: 'ma5zani.com — Plateforme e-commerce pour les vendeurs algériens',
    whatsappMessage: "Bonjour, je souhaite activer ma boutique sur ma5zani. J'ai effectué le paiement de 4000 DA. Voici la preuve de paiement :",
  },
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const storageKey = 'ma5zani-offer-deadline'
    let deadline = localStorage.getItem(storageKey)
    if (!deadline) {
      const d = new Date()
      d.setDate(d.getDate() + 5)
      deadline = d.toISOString()
      localStorage.setItem(storageKey, deadline)
    }
    const endDate = new Date(deadline)

    const tick = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return timeLeft
}

export default function OfferPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('ar')
  const countdown = useCountdown()
  const s = t[lang]
  const isRTL = lang === 'ar'

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const whatsappMessage = encodeURIComponent(s.whatsappMessage)
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
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-white">
      {/* Language Toggle */}
      <div className="fixed top-3 left-3 z-50">
        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md hover:bg-white transition-all"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          {lang === 'ar' ? 'FR' : 'عربي'}
        </button>
      </div>

      {/* Top Banner */}
      <div className="bg-[#F7941D] text-center py-3 px-4">
        <p
          className="text-white text-sm font-bold tracking-wide"
          style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
        >
          {s.topBanner}
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="bg-[#0054A6] py-4 px-4">
        <p
          className="text-white text-center text-sm font-bold mb-3"
          style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
        >
          {s.countdownTitle}
        </p>
        <div className="flex justify-center gap-3" dir="ltr">
          {[
            { value: countdown.days, label: s.day },
            { value: countdown.hours, label: s.hour },
            { value: countdown.minutes, label: s.minute },
            { value: countdown.seconds, label: s.second },
          ].map((unit, i) => (
            <div key={i} className="text-center">
              <div
                className="bg-white text-[#0054A6] rounded-lg w-14 h-14 flex items-center justify-center text-2xl font-bold"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {String(unit.value).padStart(2, '0')}
              </div>
              <p className="text-white/80 text-xs mt-1">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <p
            className="text-[#F7941D] font-semibold tracking-wide uppercase mb-3 text-sm"
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.badge}
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#0054A6] leading-tight mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.heroTitle}
          </h1>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#00AEEF] leading-tight"
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.heroPrice}
          </h2>
          <p className="text-slate-600 mt-4 text-base leading-relaxed max-w-sm mx-auto">
            {s.heroDesc}
          </p>
        </div>

        {/* Price Card */}
        <div className="bg-[#F7941D]/10 border-2 border-[#F7941D] rounded-2xl p-6 text-center mb-10">
          <span
            className="text-5xl font-bold text-[#F7941D]"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            {s.priceAmount}
          </span>
          <span className={`text-xl font-bold text-[#F7941D] ${isRTL ? 'mr-2' : 'ml-2'}`}>{s.priceCurrency}</span>
          <p className="text-slate-500 text-sm mt-2">{s.priceNote}</p>
        </div>

        {/* Features */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-10">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.featuresTitle}
          </h3>
          <ul className="space-y-4">
            {s.features.map((feature, i) => (
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
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.paymentTitle}
          </h3>

          {/* BaridiMob */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 mb-3">
            <p
              className="text-[#F7941D] font-bold text-base mb-3"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
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
                {copied === 'baridimob' ? s.copied : s.copy}
              </button>
            </div>
          </div>

          {/* RedotPay */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
            <p
              className="text-[#F7941D] font-bold text-base mb-3"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
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
                {copied === 'redotpay' ? s.copied : s.copy}
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: isRTL ? 'var(--font-outfit), var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.stepsTitle}
          </h3>

          <div className="space-y-4">
            {s.steps.map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`min-w-[40px] h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                    i === 2 ? 'bg-[#22B14C]' : 'bg-[#F7941D]'
                  }`}
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  {i + 1}
                </div>
                <span className="text-slate-700 text-[15px]">{text}</span>
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
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.ctaWhatsapp}
          </a>
          <a
            href="/signup"
            onClick={handleSignupClick}
            className="block w-full border-2 border-[#0054A6] text-[#0054A6] text-center py-4 rounded-xl text-base font-semibold hover:bg-[#0054A6] hover:text-white transition-all duration-200"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.ctaSignup}
          </a>
        </div>

        {/* Footer Note */}
        <div className="text-center border-t border-slate-200 pt-6">
          <p className="text-[#F7941D] text-sm font-bold mb-1">
            {s.footerUrgency}
          </p>
          <p className="text-slate-400 text-xs">
            {s.footerTag}
          </p>
        </div>
      </div>
    </div>
  )
}
