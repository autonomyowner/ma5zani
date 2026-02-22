'use client'

import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText, Language } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from './LandingPageOrderForm'
import { useScrollReveal } from './useScrollReveal'
import ImageGallery from './ImageGallery'
import StickyOrderBar from './StickyOrderBar'

// ============ HELPERS ============

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

interface LandingPageRendererProps {
  page: {
    pageId: string
    content: {
      headline: string
      subheadline: string
      featureBullets: Array<{ title: string; description: string }>
      ctaText: string
      urgencyText?: string
      productDescription: string
      socialProof?: string
      guaranteeText?: string
      secondaryCta?: string
      scarcityText?: string
      microCopy?: { delivery: string; payment: string; returns: string }
      deliveryTo58?: boolean
      freeDelivery?: boolean
      returnsAccepted?: boolean
    }
    design: {
      primaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      gradientFrom?: string
      gradientTo?: string
      contrastValidated?: boolean
      isDarkTheme?: boolean
    }
    templateVersion?: number
    templateType?: string
    enhancedImageKeys?: string[]
    sceneImageKeys?: string[]
  }
  product: {
    _id: Id<'products'>
    name: string
    price: number
    salePrice?: number
    imageKeys: string[]
    sizes: string[]
    colors: string[]
    stock: number
    status: string
  }
  storefront: {
    _id: Id<'storefronts'>
    slug: string
    boutiqueName: string
    sellerId: Id<'sellers'>
    metaPixelId?: string
    theme?: { primaryColor: string; accentColor: string }
    colors?: {
      primary: string
      accent: string
      background: string
      text: string
      headerBg: string
      footerBg: string
    }
  }
}

function getTrustBadges(content: LandingPageRendererProps['page']['content'], language: Language) {
  const badges: string[] = []
  badges.push(localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }))

  const hasFlags = content.deliveryTo58 !== undefined || content.freeDelivery !== undefined || content.returnsAccepted !== undefined

  if (hasFlags) {
    if (content.deliveryTo58) {
      badges.push(localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' }))
    }
    if (content.freeDelivery) {
      badges.push(localText(language, { ar: 'توصيل مجاني', en: 'Free Delivery', fr: 'Livraison gratuite' }))
    }
    if (content.returnsAccepted) {
      badges.push(localText(language, { ar: 'إرجاع مقبول', en: 'Returns Accepted', fr: 'Retours acceptes' }))
    }
    if (badges.length === 1) {
      badges.push(localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' }))
    }
  } else {
    badges.push(localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' }))
    badges.push(localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' }))
  }

  return badges
}

// Resolve storefront-aware colors
function resolveColors(page: LandingPageRendererProps['page'], storefront: LandingPageRendererProps['storefront']) {
  const bgColor = storefront.colors?.background || page.design.backgroundColor
  const txtColor = storefront.colors?.text || page.design.textColor
  const primaryColor = storefront.colors?.primary || page.design.primaryColor
  const accentColor = storefront.colors?.accent || page.design.accentColor
  const isLight = isLightColor(bgColor)

  return {
    bgColor,
    txtColor,
    primaryColor,
    accentColor,
    isLight,
    cardBg: isLight ? '#ffffff' : '#141414',
    borderColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
    textMuted: isLight ? 'rgba(0,0,0,0.50)' : 'rgba(255,255,255,0.50)',
    textSubtle: isLight ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.25)',
    sectionBg: isLight ? `${primaryColor}06` : 'rgba(255,255,255,0.03)',
    sectionBgAlt: isLight ? `${primaryColor}04` : 'rgba(255,255,255,0.02)',
    inputBg: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
  }
}

export default function LandingPageRenderer({ page, product, storefront }: LandingPageRendererProps) {
  const { language } = useLanguage()
  const incrementViews = useMutation(api.landingPages.incrementViewCount)
  const isRTL = language === 'ar'

  useEffect(() => {
    incrementViews({ pageId: page.pageId })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // v3 pages fall through to PremiumTemplate (backward compat)
  const isPremium = (page.templateVersion || 0) >= 2

  if (isPremium) {
    return <PremiumTemplate page={page} product={product} storefront={storefront} language={language} isRTL={isRTL} />
  }

  return <LegacyTemplate page={page} product={product} storefront={storefront} language={language} isRTL={isRTL} />
}

// ============ NOISE TEXTURE SVG ============

function NoiseTexture() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.03 }}>
      <filter id="lp-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#lp-noise)" />
    </svg>
  )
}

// ============ DECORATIVE GRADIENT LINE ============

function GradientLine({ accentColor }: { accentColor: string }) {
  return (
    <div
      className="h-px w-full max-w-xs mx-auto"
      style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }}
    />
  )
}

// ============ PREMIUM TEMPLATE (v2+) ============

function PremiumTemplate({
  page,
  product,
  storefront,
  language,
  isRTL,
}: LandingPageRendererProps & { language: Language; isRTL: boolean }) {
  const { content } = page
  const c = resolveColors(page, storefront)
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const savingsAmount = hasDiscount ? product.price - product.salePrice! : 0

  const hasEnhancedImage = page.enhancedImageKeys && page.enhancedImageKeys.length > 0
  const mainEnhancedUrl = hasEnhancedImage ? getR2PublicUrl(page.enhancedImageKeys![0]) : null
  const mainOriginalUrl = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const trustBadges = getTrustBadges(content, language)

  const heroReveal = useScrollReveal()
  const trustReveal = useScrollReveal()
  const benefitsReveal = useScrollReveal()
  const galleryReveal = useScrollReveal()

  return (
    <div
      className="min-h-screen relative"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: c.bgColor, color: c.txtColor }}
    >
      <NoiseTexture />

      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden">
        {/* Radial glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${c.accentColor}12 0%, transparent 70%)`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-24">
          <div
            ref={heroReveal.ref}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${
              heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Image */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              {hasEnhancedImage && mainEnhancedUrl ? (
                <div
                  className="relative aspect-square flex items-center justify-center rounded-3xl p-8"
                  style={{
                    background: c.isLight
                      ? `linear-gradient(160deg, ${c.primaryColor}10 0%, ${c.accentColor}08 100%)`
                      : `linear-gradient(160deg, rgba(255,255,255,0.04) 0%, ${c.accentColor}10 100%)`,
                  }}
                >
                  <img
                    src={mainEnhancedUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      filter: `drop-shadow(0 20px 40px ${c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'})`,
                    }}
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: c.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              ) : mainOriginalUrl ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ boxShadow: `0 25px 60px ${c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'}` }}>
                  <img
                    src={mainOriginalUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: c.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Text content */}
            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} order-2`}>
              {/* Urgency badge */}
              {content.urgencyText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-5 tracking-wide uppercase"
                  style={{
                    backgroundColor: c.accentColor + '15',
                    color: c.accentColor,
                  }}
                >
                  {content.urgencyText}
                </div>
              )}

              <h1
                className="font-bold mb-5 leading-tight tracking-tight"
                style={{
                  color: c.isLight ? c.primaryColor : c.txtColor,
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ color: c.textMuted }}>
                {content.subheadline}
              </p>

              {/* Price block */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-bold" style={{ color: c.accentColor }}>
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl line-through" style={{ color: c.textSubtle }}>
                      {product.price.toLocaleString()} DZD
                    </span>
                    <span
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: c.accentColor + '15', color: c.accentColor }}
                    >
                      {localText(language, {
                        ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                        en: `Save ${savingsAmount.toLocaleString()} DZD`,
                        fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                      })}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: c.accentColor }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              {/* CTA button with glow */}
              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-10 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: c.accentColor,
                  boxShadow: `0 8px 30px ${c.accentColor}40`,
                }}
              >
                {content.ctaText}
              </button>

              {content.socialProof && (
                <p className="mt-5 text-sm" style={{ color: c.textSubtle }}>{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === DECORATIVE LINE === */}
      <GradientLine accentColor={c.accentColor} />

      {/* === TRUST BAR === */}
      <section
        ref={trustReveal.ref}
        className={`py-6 relative transition-all duration-600 ${
          trustReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ backgroundColor: c.sectionBg }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {trustBadges.map((text, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.accentColor }}
                />
                <span className="text-sm font-medium tracking-wide" style={{ color: c.txtColor }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === BENEFITS SECTION === */}
      {content.featureBullets.length > 0 && (
        <section className="py-16 sm:py-24 relative">
          {/* Subtle radial accent glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${c.accentColor}08 0%, transparent 70%)`,
            }}
          />
          <div ref={benefitsReveal.ref} className="relative max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.featureBullets.map((bullet, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-7 transition-all duration-500 hover:shadow-lg ${
                    benefitsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    backgroundColor: c.cardBg,
                    border: `1px solid ${c.borderColor}`,
                    transitionDelay: benefitsReveal.isVisible ? `${i * 100}ms` : '0ms',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4"
                    style={{ backgroundColor: c.accentColor }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: c.isLight ? c.primaryColor : c.txtColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{bullet.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === DECORATIVE LINE === */}
      <GradientLine accentColor={c.accentColor} />

      {/* === GALLERY + DESCRIPTION === */}
      <section className="py-16 sm:py-24 relative" style={{ backgroundColor: c.sectionBgAlt }}>
        <div ref={galleryReveal.ref} className="max-w-6xl mx-auto px-4 sm:px-8">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 transition-all duration-700 ${
              galleryReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Gallery */}
            {product.imageKeys.length > 0 && (
              <div>
                <ImageGallery
                  images={product.imageKeys}
                  enhancedImages={page.enhancedImageKeys}
                  productName={product.name}
                  accentColor={c.accentColor}
                />
              </div>
            )}

            {/* Description */}
            <div className={product.imageKeys.length === 0 ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-5 tracking-tight"
                style={{ color: c.isLight ? c.primaryColor : c.txtColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line" style={{ color: c.textMuted }}>
                {content.productDescription}
              </p>

              {/* Second CTA */}
              <button
                onClick={scrollToOrder}
                className="mt-8 px-10 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: c.accentColor,
                  boxShadow: `0 8px 30px ${c.accentColor}40`,
                }}
              >
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM === */}
      <section className="py-16 sm:py-24 relative">
        {/* Radial glow behind form */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${c.accentColor}08 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-lg mx-auto px-4 sm:px-8">
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={{
              ...page.design,
              backgroundColor: c.bgColor,
              textColor: c.txtColor,
              primaryColor: c.primaryColor,
              accentColor: c.accentColor,
            }}
            ctaText={content.ctaText}
          />
        </div>
      </section>

      {/* === FOOTER === */}
      <GradientLine accentColor={c.accentColor} />
      <footer className="py-8 text-center text-sm" style={{ color: c.textSubtle }}>
        <p>{storefront.boutiqueName}</p>
      </footer>

      {/* === STICKY MOBILE CTA === */}
      <StickyOrderBar
        price={product.price}
        salePrice={product.salePrice}
        ctaText={content.ctaText}
        accentColor={c.accentColor}
        onOrderClick={scrollToOrder}
      />
    </div>
  )
}

// ============ LEGACY TEMPLATE (v1) ============

function LegacyTemplate({
  page,
  product,
  storefront,
  language,
  isRTL,
}: LandingPageRendererProps & { language: Language; isRTL: boolean }) {
  const { content } = page
  const c = resolveColors(page, storefront)
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  const mainImage = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null
  const galleryImages = product.imageKeys.map((k) => getR2PublicUrl(k))

  const trustBadges = getTrustBadges(content, language)

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen relative"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: c.bgColor, color: c.txtColor }}
    >
      <NoiseTexture />

      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${c.accentColor}10 0%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              {mainImage && (
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden"
                  style={{ boxShadow: `0 25px 60px ${c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'}` }}
                >
                  <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: c.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} order-2`}>
              {content.urgencyText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 tracking-wide uppercase"
                  style={{ backgroundColor: c.accentColor + '15', color: c.accentColor }}
                >
                  {content.urgencyText}
                </div>
              )}

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight"
                style={{ color: c.isLight ? c.primaryColor : c.txtColor, fontFamily: 'var(--font-outfit)' }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-6" style={{ color: c.textMuted }}>
                {content.subheadline}
              </p>

              <div className="flex items-center gap-3 mb-6">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold" style={{ color: c.accentColor }}>
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl line-through" style={{ color: c.textSubtle }}>
                      {product.price.toLocaleString()} DZD
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold" style={{ color: c.accentColor }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: c.accentColor, boxShadow: `0 8px 30px ${c.accentColor}40` }}
              >
                {content.ctaText}
              </button>

              {content.socialProof && (
                <p className="mt-4 text-sm" style={{ color: c.textSubtle }}>{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST BADGES === */}
      <GradientLine accentColor={c.accentColor} />
      <section className="py-6" style={{ backgroundColor: c.sectionBg }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {trustBadges.map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: c.accentColor }}>&#10004;</span>
                <span className="text-sm font-medium tracking-wide" style={{ color: c.txtColor }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <GradientLine accentColor={c.accentColor} />

      {/* === BENEFITS SECTION === */}
      {content.featureBullets.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.featureBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: c.cardBg,
                    border: `1px solid ${c.borderColor}`,
                    borderLeft: isRTL ? `1px solid ${c.borderColor}` : `4px solid ${c.accentColor}`,
                    borderRight: isRTL ? `4px solid ${c.accentColor}` : `1px solid ${c.borderColor}`,
                  }}
                >
                  <h3 className="font-bold text-lg mb-2" style={{ color: c.isLight ? c.primaryColor : c.txtColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>{bullet.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === PRODUCT DETAILS + IMAGE GALLERY === */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: c.sectionBgAlt }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {galleryImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className={galleryImages.length <= 1 ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}>
              <h2
                className="text-2xl font-bold mb-4 tracking-tight"
                style={{ color: c.isLight ? c.primaryColor : c.txtColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: c.textMuted }}>
                {content.productDescription}
              </p>

              <button
                onClick={scrollToOrder}
                className="mt-6 px-8 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: c.accentColor, boxShadow: `0 8px 30px ${c.accentColor}40` }}
              >
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM === */}
      <section className="py-14 sm:py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${c.accentColor}08 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-lg mx-auto px-4 sm:px-8">
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={{
              ...page.design,
              backgroundColor: c.bgColor,
              textColor: c.txtColor,
              primaryColor: c.primaryColor,
              accentColor: c.accentColor,
            }}
            ctaText={content.ctaText}
          />
        </div>
      </section>

      {/* === FOOTER === */}
      <GradientLine accentColor={c.accentColor} />
      <footer className="py-6 text-center text-sm" style={{ color: c.textSubtle }}>
        <p>{storefront.boutiqueName}</p>
      </footer>
    </div>
  )
}
