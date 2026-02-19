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
import LifestyleHeroTemplate from './templates/LifestyleHeroTemplate'
import EditorialTemplate from './templates/EditorialTemplate'
import ProductSpotlightTemplate from './templates/ProductSpotlightTemplate'

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
  }
}

export default function LandingPageRenderer({ page, product, storefront }: LandingPageRendererProps) {
  const { language } = useLanguage()
  const incrementViews = useMutation(api.landingPages.incrementViewCount)
  const isRTL = language === 'ar'

  // Track page view on mount
  useEffect(() => {
    incrementViews({ pageId: page.pageId })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // v3 templates: dispatch by templateType
  const isV3 = (page.templateVersion || 0) >= 3 && page.templateType
  if (isV3) {
    const v3Props = { page, product, storefront, language, isRTL }
    switch (page.templateType) {
      case 'editorial':
        return <EditorialTemplate {...v3Props} />
      case 'product-spotlight':
        return <ProductSpotlightTemplate {...v3Props} />
      case 'lifestyle-hero':
      default:
        return <LifestyleHeroTemplate {...v3Props} />
    }
  }

  const isPremium = (page.templateVersion || 0) >= 2

  if (isPremium) {
    return (
      <PremiumTemplate
        page={page}
        product={product}
        storefront={storefront}
        language={language}
        isRTL={isRTL}
      />
    )
  }

  // Legacy template (templateVersion 1 / undefined)
  return (
    <LegacyTemplate
      page={page}
      product={product}
      storefront={storefront}
      language={language}
      isRTL={isRTL}
    />
  )
}

// ============ PREMIUM TEMPLATE (v2) ============

function PremiumTemplate({
  page,
  product,
  storefront,
  language,
  isRTL,
}: LandingPageRendererProps & { language: Language; isRTL: boolean }) {
  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const savingsAmount = hasDiscount ? product.price - product.salePrice! : 0

  const hasEnhancedImage = page.enhancedImageKeys && page.enhancedImageKeys.length > 0
  const mainEnhancedUrl = hasEnhancedImage ? getR2PublicUrl(page.enhancedImageKeys![0]) : null
  const mainOriginalUrl = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null

  const gradientFrom = design.gradientFrom || design.primaryColor
  const gradientTo = design.gradientTo || (design.primaryColor + '30')

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll reveal hooks for each section
  const heroReveal = useScrollReveal()
  const trustReveal = useScrollReveal()
  const benefitsReveal = useScrollReveal()
  const galleryReveal = useScrollReveal()

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: design.backgroundColor, color: design.textColor }}
    >
      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden">
        {/* Gradient background for enhanced images */}
        {hasEnhancedImage && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}12 0%, ${gradientTo}08 100%)`,
            }}
          />
        )}

        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-20">
          <div
            ref={heroReveal.ref}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ${
              heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Image */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              {hasEnhancedImage && mainEnhancedUrl ? (
                // Floating product on gradient
                <div
                  className="relative aspect-square flex items-center justify-center rounded-3xl p-8"
                  style={{
                    background: `linear-gradient(160deg, ${gradientFrom}18 0%, ${gradientTo}10 100%)`,
                  }}
                >
                  <img
                    src={mainEnhancedUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                    }}
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: design.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              ) : mainOriginalUrl ? (
                // Original image in rounded frame
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={mainOriginalUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: design.accentColor }}
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
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                  style={{
                    backgroundColor: design.accentColor + '15',
                    color: design.accentColor,
                  }}
                >
                  {content.urgencyText}
                </div>
              )}

              <h1
                className="font-bold mb-5 leading-tight"
                style={{
                  color: design.primaryColor,
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ opacity: 0.75 }}>
                {content.subheadline}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                {hasDiscount ? (
                  <>
                    <span
                      className="text-3xl sm:text-4xl font-bold"
                      style={{ color: design.accentColor }}
                    >
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl text-slate-400 line-through">
                      {product.price.toLocaleString()} DZD
                    </span>
                    <span
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: design.accentColor + '15', color: design.accentColor }}
                    >
                      {localText(language, {
                        ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                        en: `Save ${savingsAmount.toLocaleString()} DZD`,
                        fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                      })}
                    </span>
                  </>
                ) : (
                  <span
                    className="text-3xl sm:text-4xl font-bold"
                    style={{ color: design.accentColor }}
                  >
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              {/* CTA button */}
              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 24px ${design.accentColor}40`,
                }}
              >
                {content.ctaText}
              </button>

              {/* Social proof */}
              {content.socialProof && (
                <p className="mt-5 text-sm" style={{ opacity: 0.5 }}>{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST BAR === */}
      <section
        ref={trustReveal.ref}
        className={`py-5 transition-all duration-600 ${
          trustReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ backgroundColor: design.primaryColor + '06' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }),
              localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' }),
              localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' }),
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: design.accentColor }}
                />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === BENEFITS SECTION === */}
      {content.featureBullets.length > 0 && (
        <section className="py-14 sm:py-20">
          <div ref={benefitsReveal.ref} className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.featureBullets.map((bullet, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-7 transition-all duration-500 hover:shadow-md ${
                    benefitsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    backgroundColor: design.primaryColor + '06',
                    transitionDelay: benefitsReveal.isVisible ? `${i * 100}ms` : '0ms',
                  }}
                >
                  {/* Numbered badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4"
                    style={{ backgroundColor: design.accentColor }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: design.primaryColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ opacity: 0.65 }}>{bullet.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === GALLERY + DESCRIPTION === */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: design.primaryColor + '04' }}>
        <div ref={galleryReveal.ref} className="max-w-6xl mx-auto px-4">
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
                  accentColor={design.accentColor}
                />
              </div>
            )}

            {/* Description */}
            <div className={product.imageKeys.length === 0 ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-5"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line" style={{ opacity: 0.75 }}>
                {content.productDescription}
              </p>

              {/* Second CTA */}
              <button
                onClick={scrollToOrder}
                className="mt-8 px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 24px ${design.accentColor}40`,
                }}
              >
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM === */}
      <section className="py-14 sm:py-20">
        <div className="max-w-lg mx-auto px-4">
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={design}
            ctaText={content.ctaText}
          />
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-8 text-center text-sm" style={{ opacity: 0.4, borderTop: `1px solid ${design.textColor}10` }}>
        <p>{storefront.boutiqueName}</p>
      </footer>

      {/* === STICKY MOBILE CTA === */}
      <StickyOrderBar
        price={product.price}
        salePrice={product.salePrice}
        ctaText={content.ctaText}
        accentColor={design.accentColor}
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
  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  const mainImage = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null
  const galleryImages = product.imageKeys.map((k) => getR2PublicUrl(k))

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: design.backgroundColor, color: design.textColor }}
    >
      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              {mainImage && (
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: design.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Text content */}
            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} order-2`}>
              {content.urgencyText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                  style={{
                    backgroundColor: design.accentColor + '15',
                    color: design.accentColor,
                  }}
                >
                  {content.urgencyText}
                </div>
              )}

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-6 opacity-80">
                {content.subheadline}
              </p>

              <div className="flex items-center gap-3 mb-6">
                {hasDiscount ? (
                  <>
                    <span
                      className="text-3xl font-bold"
                      style={{ color: design.accentColor }}
                    >
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl text-slate-400 line-through">
                      {product.price.toLocaleString()} DZD
                    </span>
                  </>
                ) : (
                  <span
                    className="text-3xl font-bold"
                    style={{ color: design.accentColor }}
                  >
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: design.accentColor }}
              >
                {content.ctaText}
              </button>

              {content.socialProof && (
                <p className="mt-4 text-sm opacity-60">{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST BADGES === */}
      <section className="py-6 border-y" style={{ borderColor: design.textColor + '15' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* === BENEFITS SECTION === */}
      {content.featureBullets.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.featureBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: design.primaryColor + '08',
                    borderLeft: isRTL ? 'none' : `4px solid ${design.accentColor}`,
                    borderRight: isRTL ? `4px solid ${design.accentColor}` : 'none',
                  }}
                >
                  <h3 className="font-bold text-lg mb-2" style={{ color: design.primaryColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm opacity-70">{bullet.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === PRODUCT DETAILS + IMAGE GALLERY === */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: design.primaryColor + '05' }}>
        <div className="max-w-6xl mx-auto px-4">
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
                className="text-2xl font-bold mb-4"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base leading-relaxed opacity-80 whitespace-pre-line">
                {content.productDescription}
              </p>

              <button
                onClick={scrollToOrder}
                className="mt-6 px-8 py-4 rounded-xl text-white font-bold text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: design.accentColor }}
              >
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM === */}
      <section className="py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-4">
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={design}
            ctaText={content.ctaText}
          />
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-6 text-center text-sm opacity-50" style={{ borderTop: `1px solid ${design.textColor}15` }}>
        <p>{storefront.boutiqueName}</p>
      </footer>
    </div>
  )
}
