'use client'

import { useState, useEffect } from 'react'
import { trackEvent } from '@/lib/meta-pixel'
import Image from 'next/image'

type Lang = 'ar' | 'fr'

const t = {
  ar: {
    topBanner: 'جرّب مجاناً — بدون التزام',
    badge: 'أول 50 بائع',
    heroTitle: 'متجرك الإلكتروني جاهز',
    heroSubtitle: 'في 5 دقائق',
    heroDesc: 'أنشئ متجرك، أضف منتجاتك، وابدأ استقبال الطلبات — مجاناً لمدة 14 يوم',
    ctaTrial: 'ابدأ تجربتك المجانية',
    ctaTrialSub: '14 يوم مجاناً — بدون دفع',
    socialProofTitle: 'متاجر حقيقية تبيع الآن',
    socialProofDesc: 'بائعين جزائريين يستخدمون ma5zani يومياً',
    featuresTitle: 'كل ما تحتاجه لتبيع أونلاين',
    features: [
      { title: 'متجر احترافي', desc: 'رابط خاص بك + قوالب جاهزة' },
      { title: 'إدارة كاملة', desc: 'منتجات، طلبات، مخزون' },
      { title: 'مساعد ذكي AI', desc: 'يرد على عملائك 24/7 تلقائياً' },
      { title: 'إشعارات فورية', desc: 'كل طلبية توصلك مباشرة' },
      { title: 'تحليلات المبيعات', desc: 'تابع أداء متجرك لحظة بلحظة' },
      { title: 'Meta Pixel', desc: 'تتبع إعلاناتك وتحويلاتك' },
    ],
    problemTitle: 'مازال تبيع في الـ DM؟',
    problems: [
      'طلبات ضايعة في الرسائل',
      'ما عندك رابط احترافي تشاركو',
      'ما تعرفش شحال بعت هاد الشهر',
      'العملاء يسقسيو ومكاش لي يجاوبهم',
    ],
    problemCta: 'ma5zani يحل كل هذا',
    storesTitle: 'شوف النتيجة بعينيك',
    howTitle: 'كيفاش تبدأ؟',
    steps: [
      { title: 'سجّل مجاناً', desc: 'في أقل من دقيقة' },
      { title: 'أضف منتجاتك', desc: 'صور + أسعار + وصف' },
      { title: 'شارك رابط متجرك', desc: 'على Instagram، Facebook، TikTok' },
    ],
    founderTitle: 'عرض افتتاح',
    founderDesc: 'بعد التجربة المجانية، اشترك بعرض خاص للبائعين الأوائل',
    founderPrice: '4,000',
    founderCurrency: 'دج',
    founderPeriod: '/ السنة',
    founderNote: 'بدل الأسعار العادية (12,000 - 94,800 دج/السنة)',
    founderFeatures: [
      'كل المميزات مفتوحة',
      'سنة كاملة',
      'بدون رسوم إضافية',
      'أول 50 بائع فقط',
    ],
    founderCta: 'جرّب مجاناً أولاً ثم اشترك',
    paymentTitle: 'طريقة الدفع بعد التجربة',
    copied: 'تم النسخ',
    copy: 'نسخ',
    ctaWhatsapp: 'أرسل إثبات الدفع عبر واتساب',
    finalCtaTitle: 'جاهز تبدأ؟',
    finalCtaDesc: '14 يوم مجاناً — سجّل الآن وابدأ البيع',
    finalCtaButton: 'ابدأ مجاناً الآن',
    footerTag: 'ma5zani.com — منصة التجارة الإلكترونية للبائعين الجزائريين',
    whatsappMessage: 'السلام عليكم، أريد تفعيل متجري في ma5zani. لقد قمت بالدفع 4000 دج. إليكم إثبات الدفع:',
  },
  fr: {
    topBanner: 'Essayez gratuitement — sans engagement',
    badge: 'Les 50 premiers vendeurs',
    heroTitle: 'Votre boutique en ligne prête',
    heroSubtitle: 'en 5 minutes',
    heroDesc: 'Créez votre boutique, ajoutez vos produits, et commencez à recevoir des commandes — gratuit pendant 14 jours',
    ctaTrial: 'Commencer l\'essai gratuit',
    ctaTrialSub: '14 jours gratuits — sans paiement',
    socialProofTitle: 'Des vraies boutiques qui vendent maintenant',
    socialProofDesc: 'Des vendeurs algériens utilisent ma5zani chaque jour',
    featuresTitle: 'Tout ce qu\'il faut pour vendre en ligne',
    features: [
      { title: 'Boutique pro', desc: 'Votre propre lien + templates prêts' },
      { title: 'Gestion complète', desc: 'Produits, commandes, stocks' },
      { title: 'Assistant IA', desc: 'Répond à vos clients 24/7 automatiquement' },
      { title: 'Notifications instantanées', desc: 'Chaque commande vous arrive directement' },
      { title: 'Analyses des ventes', desc: 'Suivez vos performances en temps réel' },
      { title: 'Meta Pixel', desc: 'Suivez vos pubs et conversions' },
    ],
    problemTitle: 'Vous vendez encore en DM ?',
    problems: [
      'Commandes perdues dans les messages',
      'Pas de lien professionnel à partager',
      'Vous ne savez pas combien vous avez vendu ce mois',
      'Les clients posent des questions et personne pour répondre',
    ],
    problemCta: 'ma5zani résout tout ça',
    storesTitle: 'Voyez le résultat par vous-même',
    howTitle: 'Comment commencer ?',
    steps: [
      { title: 'Inscrivez-vous gratuitement', desc: 'En moins d\'une minute' },
      { title: 'Ajoutez vos produits', desc: 'Photos + prix + description' },
      { title: 'Partagez votre lien', desc: 'Sur Instagram, Facebook, TikTok' },
    ],
    founderTitle: 'Offre fondateurs',
    founderDesc: 'Après l\'essai gratuit, abonnez-vous avec une offre spéciale pour les premiers vendeurs',
    founderPrice: '4 000',
    founderCurrency: 'DA',
    founderPeriod: '/ an',
    founderNote: 'Au lieu des prix normaux (12 000 - 94 800 DA/an)',
    founderFeatures: [
      'Toutes les fonctionnalités incluses',
      'Une année complète',
      'Sans frais supplémentaires',
      'Les 50 premiers vendeurs seulement',
    ],
    founderCta: 'Essayez gratuitement d\'abord puis abonnez-vous',
    paymentTitle: 'Méthode de paiement après l\'essai',
    copied: 'Copié',
    copy: 'Copier',
    ctaWhatsapp: 'Envoyer la preuve via WhatsApp',
    finalCtaTitle: 'Prêt à commencer ?',
    finalCtaDesc: '14 jours gratuits — inscrivez-vous et commencez à vendre',
    finalCtaButton: 'Commencer gratuitement',
    footerTag: 'ma5zani.com — Plateforme e-commerce pour les vendeurs algériens',
    whatsappMessage: 'Bonjour, je souhaite activer ma boutique sur ma5zani. J\'ai effectué le paiement de 4000 DA. Voici la preuve de paiement :',
  },
}

export default function OfferPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('ar')
  const [mounted, setMounted] = useState(false)
  const s = t[lang]
  const isRTL = lang === 'ar'

  useEffect(() => { setMounted(true) }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const whatsappMessage = encodeURIComponent(s.whatsappMessage)
  const whatsappLink = `https://wa.me/213697339450?text=${whatsappMessage}`

  const handleTrialClick = () => {
    trackEvent('Lead', {
      content_name: 'Free Trial Signup',
      content_category: 'Registration',
    })
  }

  const handleWhatsAppClick = () => {
    trackEvent('Lead', {
      content_name: 'Founder Offer 4000DA',
      content_category: 'WhatsApp Checkout',
      value: 4000,
      currency: 'DZD',
    })
  }

  const storeImages = [
    { src: '/images/stores/store-clothing.jpg', alt: 'Clothing store' },
    { src: '/images/stores/store-watches-dark.jpg', alt: 'Watches store dark' },
    { src: '/images/stores/store-watches-grid.jpg', alt: 'Watches store grid' },
  ]

  if (!mounted) return null

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

      {/* Top Banner - Free Trial */}
      <div className="bg-[#22B14C] text-center py-3 px-4">
        <p
          className="text-white text-sm font-bold tracking-wide"
          style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
        >
          {s.topBanner}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#F7941D]/10 text-[#F7941D] px-4 py-1.5 rounded-full text-sm font-bold mb-5">
            {s.badge}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#0054A6] leading-tight mb-1"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.heroTitle}
          </h1>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#00AEEF] leading-tight mb-4"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.heroSubtitle}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-sm mx-auto mb-6">
            {s.heroDesc}
          </p>

          {/* Primary CTA - Free Trial */}
          <a
            href="/signup"
            onClick={handleTrialClick}
            className="block w-full bg-[#22B14C] text-white text-center py-4 rounded-xl text-lg font-bold hover:bg-[#1a9e3f] transition-all duration-200 shadow-lg shadow-[#22B14C]/30 mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.ctaTrial}
          </a>
          <p className="text-slate-400 text-sm">{s.ctaTrialSub}</p>
        </div>

        {/* Pain Points */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-8">
          <h3
            className="text-xl font-bold text-slate-800 text-center mb-5"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.problemTitle}
          </h3>
          <ul className="space-y-3 mb-5">
            {s.problems.map((problem, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-red-400 text-lg font-bold flex-shrink-0">✕</span>
                <span className="text-slate-600 text-[15px]">{problem}</span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <span
              className="text-[#22B14C] font-bold text-base"
              style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
            >
              {s.problemCta}
            </span>
          </div>
        </div>

        {/* Real Store Screenshots */}
        <div className="mb-8">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.storesTitle}
          </h3>
          <p className="text-slate-500 text-sm text-center mb-5">{s.socialProofDesc}</p>

          {/* Phone mockup grid */}
          <div className="grid grid-cols-3 gap-2">
            {storeImages.map((img, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-lg"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={200}
                  height={400}
                  className="w-full h-auto object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.featuresTitle}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {s.features.map((feature, i) => (
              <div key={i} className="bg-white border-2 border-slate-100 rounded-xl p-4">
                <p className="text-[#0054A6] font-bold text-sm mb-1">{feature.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-8">
          <h3
            className="text-xl font-bold text-[#0054A6] text-center mb-5"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.howTitle}
          </h3>
          <div className="space-y-4">
            {s.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="min-w-[44px] h-11 rounded-full bg-[#0054A6] flex items-center justify-center text-white text-lg font-bold"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-[15px]">{step.title}</p>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mid-page CTA */}
        <a
          href="/signup"
          onClick={handleTrialClick}
          className="block w-full bg-[#22B14C] text-white text-center py-4 rounded-xl text-lg font-bold hover:bg-[#1a9e3f] transition-all duration-200 shadow-lg shadow-[#22B14C]/30 mb-10"
          style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
        >
          {s.ctaTrial}
        </a>

        {/* Founder Offer Section */}
        <div className="bg-[#0054A6] rounded-2xl p-6 mb-8 text-white">
          <div className="text-center mb-5">
            <p className="text-[#00AEEF] text-sm font-bold tracking-wide uppercase mb-2">{s.founderTitle}</p>
            <p className="text-white/80 text-sm mb-4">{s.founderDesc}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="text-5xl font-bold text-white"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {s.founderPrice}
              </span>
              <span className="text-xl font-bold text-white/80">{s.founderCurrency}</span>
              <span className="text-white/60 text-sm">{s.founderPeriod}</span>
            </div>
            <p className="text-white/50 text-xs mt-2 line-through">{s.founderNote}</p>
          </div>

          <ul className="space-y-2 mb-5">
            {s.founderFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-[#22B14C] font-bold">+</span>
                <span className="text-white/90 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <p className="text-center text-white/60 text-sm">{s.founderCta}</p>
        </div>

        {/* Payment Methods (collapsed/secondary) */}
        <details className="mb-8 group">
          <summary
            className="text-center text-[#0054A6] font-semibold text-sm cursor-pointer hover:underline list-none"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.paymentTitle} ↓
          </summary>
          <div className="mt-4 space-y-3">
            {/* BaridiMob */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
              <p className="text-[#F7941D] font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                BaridiMob
              </p>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-800 text-xs tracking-wide break-all" dir="ltr" style={{ fontFamily: 'monospace' }}>
                  00799999002364042690
                </span>
                <button
                  onClick={() => copyToClipboard('00799999002364042690', 'baridimob')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
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
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
              <p className="text-[#F7941D] font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                RedotPay
              </p>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-800 text-xs tracking-wider" dir="ltr" style={{ fontFamily: 'monospace' }}>
                  1880405318
                </span>
                <button
                  onClick={() => copyToClipboard('1880405318', 'redotpay')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    copied === 'redotpay'
                      ? 'bg-[#22B14C] text-white'
                      : 'bg-[#F7941D] text-white hover:bg-[#D35400]'
                  }`}
                >
                  {copied === 'redotpay' ? s.copied : s.copy}
                </button>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="block w-full bg-[#25D366] text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-[#1fb855] transition-all duration-200"
              style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
            >
              {s.ctaWhatsapp}
            </a>
          </div>
        </details>

        {/* Final CTA */}
        <div className="bg-gradient-to-b from-[#0054A6] to-[#003d7a] rounded-2xl p-8 text-center mb-8">
          <h3
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.finalCtaTitle}
          </h3>
          <p className="text-white/70 text-sm mb-5">{s.finalCtaDesc}</p>
          <a
            href="/signup"
            onClick={handleTrialClick}
            className="block w-full bg-[#22B14C] text-white text-center py-4 rounded-xl text-lg font-bold hover:bg-[#1a9e3f] transition-all duration-200 shadow-lg"
            style={{ fontFamily: isRTL ? 'var(--font-cairo), var(--font-outfit), sans-serif' : 'var(--font-outfit), sans-serif' }}
          >
            {s.finalCtaButton}
          </a>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-slate-400 text-xs">{s.footerTag}</p>
        </div>
      </div>
    </div>
  )
}
