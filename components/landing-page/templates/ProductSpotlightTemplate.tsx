'use client'

import { localText } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from '../LandingPageOrderForm'
import { useScrollReveal } from '../useScrollReveal'
import ImageGallery from '../ImageGallery'
import StickyOrderBar from '../StickyOrderBar'
import TrustBar from '../sections/TrustBar'
import TestimonialSection from '../sections/TestimonialSection'
import GuaranteeStrip from '../sections/GuaranteeStrip'
import MicroCopyBar from '../sections/MicroCopyBar'
import { V3TemplateProps } from './types'

export default function ProductSpotlightTemplate({ page, product, storefront, language, isRTL }: V3TemplateProps) {
  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const savingsAmount = hasDiscount ? product.price - product.salePrice! : 0

  const sceneKeys = page.sceneImageKeys || []
  const enhancedKey = page.enhancedImageKeys?.[0]
  const mainOriginalUrl = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroReveal = useScrollReveal()
  const priceReveal = useScrollReveal()
  const featuresReveal = useScrollReveal()
  const galleryReveal = useScrollReveal()
  const descReveal = useScrollReveal()

  // Dark theme bg colors
  const darkBg = '#0a0a0a'
  const cardBg = '#141414'
  const elevatedBg = '#1a1a1a'

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: darkBg, color: design.textColor }}
    >
      {/* === DARK HERO: Radial spotlight behind product === */}
      <section className="relative overflow-hidden min-h-[75vh] sm:min-h-[85vh] flex items-center">
        {/* Scene #1 subtle bg */}
        {sceneKeys[0] && (
          <img
            src={getR2PublicUrl(sceneKeys[0])}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.15 }}
          />
        )}

        {/* Radial spotlight glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${design.accentColor}12 0%, transparent 70%), linear-gradient(to bottom, transparent 60%, ${darkBg} 100%)`,
          }}
        />

        <div
          ref={heroReveal.ref}
          className={`relative max-w-6xl mx-auto px-4 py-12 sm:py-20 w-full transition-all duration-700 ${
            heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Product with spotlight effect */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              <div className="relative aspect-square flex items-center justify-center">
                {/* Glow circle behind product */}
                <div
                  className="absolute inset-[10%] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${design.accentColor}10 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />
                {enhancedKey ? (
                  <img
                    src={getR2PublicUrl(enhancedKey)}
                    alt={product.name}
                    className="relative max-w-[85%] max-h-[85%] object-contain"
                    style={{
                      filter: `drop-shadow(0 0 40px ${design.accentColor}20) drop-shadow(0 20px 40px rgba(0,0,0,0.4))`,
                    }}
                  />
                ) : mainOriginalUrl ? (
                  <div className="relative w-[85%] aspect-square rounded-2xl overflow-hidden">
                    <img src={mainOriginalUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {hasDiscount && (
                  <div
                    className="absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold text-sm"
                    style={{
                      backgroundColor: design.accentColor,
                      boxShadow: `0 0 20px ${design.accentColor}50`,
                    }}
                  >
                    -{discountPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* Text content */}
            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} order-2`}>
              {content.scarcityText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                  style={{
                    backgroundColor: design.accentColor + '20',
                    color: design.accentColor,
                    boxShadow: `0 0 12px ${design.accentColor}15`,
                  }}
                >
                  {content.scarcityText}
                </div>
              )}

              <h1
                className="font-bold mb-5 leading-tight"
                style={{
                  color: design.textColor,
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ opacity: 0.6 }}>
                {content.subheadline}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-bold" style={{ color: design.accentColor }}>
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl line-through" style={{ opacity: 0.35 }}>
                      {product.price.toLocaleString()} DZD
                    </span>
                    <span
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: design.accentColor + '20', color: design.accentColor }}
                    >
                      {localText(language, {
                        ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                        en: `Save ${savingsAmount.toLocaleString()} DZD`,
                        fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                      })}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: design.accentColor }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 30px ${design.accentColor}40, 0 0 20px ${design.accentColor}15`,
                }}
              >
                {content.ctaText}
              </button>

              {content.socialProof && (
                <p className="mt-5 text-sm" style={{ opacity: 0.4 }}>{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === NEON TRUST BAR === */}
      <section
        className="py-4"
        style={{
          borderTop: `1px solid ${design.accentColor}15`,
          borderBottom: `1px solid ${design.accentColor}15`,
        }}
      >
        <TrustBar language={language} accentColor={design.accentColor} primaryColor={design.primaryColor} isDark />
      </section>

      {/* === LARGE PRICE DISPLAY CARD === */}
      {hasDiscount && (
        <section className="py-10 sm:py-14">
          <div ref={priceReveal.ref} className="max-w-md mx-auto px-4">
            <div
              className={`rounded-2xl p-8 text-center transition-all duration-700 ${
                priceReveal.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                backgroundColor: design.accentColor,
                boxShadow: `0 0 40px ${design.accentColor}30`,
              }}
            >
              <p className="text-white text-sm font-medium mb-2" style={{ opacity: 0.8 }}>
                {localText(language, { ar: 'سعر خاص', en: 'Special Price', fr: 'Prix special' })}
              </p>
              <p className="text-white text-4xl sm:text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
                {product.salePrice!.toLocaleString()} DZD
              </p>
              <p className="text-white text-lg line-through mb-3" style={{ opacity: 0.5 }}>
                {product.price.toLocaleString()} DZD
              </p>
              <p className="text-white text-sm font-bold">
                {localText(language, {
                  ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                  en: `Save ${savingsAmount.toLocaleString()} DZD`,
                  fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* === FEATURE CARDS (glow borders on dark) === */}
      {content.featureBullets.length > 0 && (
        <section className="py-14 sm:py-20">
          <div ref={featuresReveal.ref} className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.featureBullets.slice(0, 4).map((bullet, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-7 transition-all duration-500 ${
                    featuresReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${design.accentColor}12`,
                    transitionDelay: featuresReveal.isVisible ? `${i * 100}ms` : '0ms',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-4"
                    style={{
                      backgroundColor: design.accentColor + '20',
                      color: design.accentColor,
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: design.textColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ opacity: 0.5 }}>
                    {bullet.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === TESTIMONIAL (dark variant) === */}
      {content.testimonial && (
        <TestimonialSection
          testimonial={content.testimonial}
          primaryColor={design.primaryColor}
          accentColor={design.accentColor}
          isDark
        />
      )}

      {/* === DARK GALLERY === */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: cardBg }}>
        <div ref={galleryReveal.ref} className="max-w-6xl mx-auto px-4">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 transition-all duration-700 ${
              galleryReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Gallery with scene images */}
            <div>
              <ImageGallery
                images={[...sceneKeys, ...product.imageKeys]}
                enhancedImages={page.enhancedImageKeys}
                productName={product.name}
                accentColor={design.accentColor}
              />
            </div>

            {/* Description */}
            <div
              ref={descReveal.ref}
              className={`transition-all duration-700 ${
                descReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold mb-5"
                style={{ color: design.textColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line mb-6" style={{ opacity: 0.6 }}>
                {content.productDescription}
              </p>

              {content.guaranteeText && (
                <div className="mb-6">
                  <GuaranteeStrip text={content.guaranteeText} accentColor={design.accentColor} isDark />
                </div>
              )}

              {content.microCopy && (
                <div className="mb-8">
                  <MicroCopyBar microCopy={content.microCopy} accentColor={design.accentColor} isDark />
                </div>
              )}

              <button
                onClick={scrollToOrder}
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 30px ${design.accentColor}40`,
                }}
              >
                {content.secondaryCta || content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM (on slightly lighter card) === */}
      <section className="py-14 sm:py-20">
        <div className="max-w-lg mx-auto px-4">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: elevatedBg,
              border: `1px solid ${design.accentColor}10`,
            }}
          >
            <LandingPageOrderForm
              product={product}
              storefront={storefront}
              pageId={page.pageId}
              design={design}
              ctaText={content.ctaText}
            />
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer
        className="py-8 text-center text-sm"
        style={{ opacity: 0.3, borderTop: `1px solid #ffffff10` }}
      >
        <p>{storefront.boutiqueName}</p>
      </footer>

      {/* === STICKY MOBILE CTA (dark variant) === */}
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
