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

export default function EditorialTemplate({ page, product, storefront, language, isRTL }: V3TemplateProps) {
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
  const sceneReveal = useScrollReveal()
  const altSectionReveal = useScrollReveal()
  const benefitsReveal = useScrollReveal()
  const galleryReveal = useScrollReveal()

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: design.backgroundColor, color: design.textColor }}
    >
      {/* === MAGAZINE HERO: Oversized headline + small floating product === */}
      <section className="relative overflow-hidden">
        <div
          ref={heroReveal.ref}
          className={`max-w-6xl mx-auto px-4 py-16 sm:py-24 transition-all duration-700 ${
            heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Big headline area — 2/3 width */}
            <div className="lg:col-span-2">
              {content.scarcityText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
                  style={{
                    backgroundColor: design.accentColor + '15',
                    color: design.accentColor,
                  }}
                >
                  {content.scarcityText}
                </div>
              )}

              <h1
                className="font-bold leading-[0.95] mb-6"
                style={{
                  color: design.primaryColor,
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-8 max-w-lg leading-relaxed" style={{ opacity: 0.6 }}>
                {content.subheadline}
              </p>

              {/* Price row */}
              <div className="flex items-center gap-4 mb-8 flex-wrap">
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
                      style={{ backgroundColor: design.accentColor + '15', color: design.accentColor }}
                    >
                      -{discountPercent}%
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
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 24px ${design.accentColor}40`,
                }}
              >
                {content.ctaText}
              </button>
            </div>

            {/* Small floating product — 1/3 width */}
            <div className="hidden lg:flex items-center justify-center">
              {enhancedKey ? (
                <div
                  className="relative w-full aspect-square flex items-center justify-center rounded-3xl p-6"
                  style={{
                    background: `linear-gradient(160deg, ${design.gradientFrom || design.primaryColor}12 0%, ${design.gradientTo || design.primaryColor}06 100%)`,
                  }}
                >
                  <img
                    src={getR2PublicUrl(enhancedKey)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.12))' }}
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-xs"
                      style={{ backgroundColor: design.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              ) : mainOriginalUrl ? (
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <img src={mainOriginalUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* === FULL-WIDTH SCENE #1 === */}
      {sceneKeys[0] && (
        <section
          ref={sceneReveal.ref}
          className={`transition-all duration-700 ${
            sceneReveal.isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full aspect-[21/9] overflow-hidden">
            <img
              src={getR2PublicUrl(sceneKeys[0])}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* === TRUST BAR === */}
      <TrustBar language={language} accentColor={design.accentColor} primaryColor={design.primaryColor} />

      {/* === ALTERNATING SECTIONS: scene + text === */}
      <section className="py-14 sm:py-20">
        <div ref={altSectionReveal.ref} className="max-w-6xl mx-auto px-4 space-y-16 sm:space-y-24">
          {/* Row 1: Scene #2 + text */}
          {sceneKeys[1] && (
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${
                altSectionReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className={isRTL ? 'lg:order-2' : 'lg:order-1'}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img src={getR2PublicUrl(sceneKeys[1])} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={isRTL ? 'lg:order-1' : 'lg:order-2'}>
                {content.featureBullets[0] && (
                  <>
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
                    >
                      {content.featureBullets[0].title}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ opacity: 0.65 }}>
                      {content.featureBullets[0].description}
                    </p>
                  </>
                )}
                {content.featureBullets[1] && (
                  <div className="mt-8">
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
                    >
                      {content.featureBullets[1].title}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ opacity: 0.65 }}>
                      {content.featureBullets[1].description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Row 2: text + Scene #3 (reversed) */}
          {sceneKeys[2] && (
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${
                altSectionReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className={isRTL ? 'lg:order-1' : 'lg:order-2'}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img src={getR2PublicUrl(sceneKeys[2])} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={isRTL ? 'lg:order-2' : 'lg:order-1'}>
                {content.featureBullets[2] && (
                  <>
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
                    >
                      {content.featureBullets[2].title}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ opacity: 0.65 }}>
                      {content.featureBullets[2].description}
                    </p>
                  </>
                )}
                {content.featureBullets[3] && (
                  <div className="mt-8">
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
                    >
                      {content.featureBullets[3].title}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ opacity: 0.65 }}>
                      {content.featureBullets[3].description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback: numbered benefits (if no scene images) */}
          {!sceneKeys[1] && content.featureBullets.length > 0 && (
            <div
              ref={benefitsReveal.ref}
              className={`space-y-6 max-w-3xl mx-auto transition-all duration-700 ${
                benefitsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {content.featureBullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-6">
                  <span
                    className="text-4xl sm:text-5xl font-bold flex-shrink-0 leading-none"
                    style={{ color: design.accentColor, opacity: 0.3, fontFamily: 'var(--font-outfit)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: design.primaryColor }}>
                      {bullet.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ opacity: 0.65 }}>
                      {bullet.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === TESTIMONIAL (pull-quote style) === */}
      {content.testimonial && (
        <TestimonialSection
          testimonial={content.testimonial}
          primaryColor={design.primaryColor}
          accentColor={design.accentColor}
        />
      )}

      {/* === GALLERY + DESCRIPTION === */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: design.primaryColor + '04' }}>
        <div ref={galleryReveal.ref} className="max-w-6xl mx-auto px-4">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 transition-all duration-700 ${
              galleryReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
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

            <div className={product.imageKeys.length === 0 ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-5"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line mb-6" style={{ opacity: 0.75 }}>
                {content.productDescription}
              </p>

              {content.guaranteeText && (
                <div className="mb-6">
                  <GuaranteeStrip text={content.guaranteeText} accentColor={design.accentColor} />
                </div>
              )}

              {content.microCopy && (
                <div className="mb-8">
                  <MicroCopyBar microCopy={content.microCopy} accentColor={design.accentColor} />
                </div>
              )}

              <button
                onClick={scrollToOrder}
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: design.accentColor,
                  boxShadow: `0 8px 24px ${design.accentColor}40`,
                }}
              >
                {content.secondaryCta || content.ctaText}
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
