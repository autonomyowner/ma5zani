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

export default function LifestyleHeroTemplate({ page, product, storefront, language, isRTL }: V3TemplateProps) {
  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const savingsAmount = hasDiscount ? product.price - product.salePrice! : 0

  const sceneKeys = page.sceneImageKeys || []
  const hasScenes = sceneKeys.length > 0
  const enhancedKey = page.enhancedImageKeys?.[0]
  const mainOriginalUrl = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroReveal = useScrollReveal()
  const splitReveal = useScrollReveal()
  const galleryReveal = useScrollReveal()
  const descReveal = useScrollReveal()

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: design.backgroundColor, color: design.textColor }}
    >
      {/* === HERO: Full-bleed scene bg with overlay === */}
      <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] flex items-center">
        {/* Scene #1 as bg */}
        {hasScenes ? (
          <>
            <img
              src={getR2PublicUrl(sceneKeys[0])}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${design.backgroundColor}ee 0%, ${design.backgroundColor}80 50%, transparent 100%)`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${design.gradientFrom || design.primaryColor}15 0%, ${design.gradientTo || design.primaryColor}08 100%)`,
            }}
          />
        )}

        <div
          ref={heroReveal.ref}
          className={`relative max-w-6xl mx-auto px-4 py-12 sm:py-20 w-full transition-all duration-700 ${
            heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className={`max-w-xl ${isRTL ? 'mr-0 ml-auto' : 'ml-0 mr-auto'}`}>
            {/* Scarcity badge */}
            {content.scarcityText && (
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                style={{
                  backgroundColor: design.accentColor + '15',
                  color: design.accentColor,
                }}
              >
                {content.scarcityText}
              </div>
            )}

            <h1
              className="font-bold mb-5 leading-tight"
              style={{
                color: design.primaryColor,
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              }}
            >
              {content.headline}
            </h1>

            <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ opacity: 0.75 }}>
              {content.subheadline}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: design.accentColor }}>
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
                boxShadow: `0 8px 24px ${design.accentColor}40`,
              }}
            >
              {content.ctaText}
            </button>

            {content.socialProof && (
              <p className="mt-5 text-sm" style={{ opacity: 0.5 }}>{content.socialProof}</p>
            )}
          </div>
        </div>
      </section>

      {/* === TRUST BAR === */}
      <TrustBar language={language} accentColor={design.accentColor} primaryColor={design.primaryColor} />

      {/* === SPLIT SECTION: Scene #2 + benefits === */}
      {content.featureBullets.length > 0 && (
        <section className="py-14 sm:py-20">
          <div ref={splitReveal.ref} className="max-w-6xl mx-auto px-4">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${
                splitReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {/* Scene #2 or enhanced product image */}
              <div className={isRTL ? 'lg:order-2' : 'lg:order-1'}>
                {sceneKeys[1] ? (
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={getR2PublicUrl(sceneKeys[1])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : enhancedKey ? (
                  <div
                    className="aspect-square rounded-2xl flex items-center justify-center p-8"
                    style={{
                      background: `linear-gradient(160deg, ${design.gradientFrom || design.primaryColor}18 0%, ${design.gradientTo || design.primaryColor}10 100%)`,
                    }}
                  >
                    <img
                      src={getR2PublicUrl(enhancedKey)}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}
                    />
                  </div>
                ) : mainOriginalUrl ? (
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img src={mainOriginalUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>

              {/* Benefit cards */}
              <div className={isRTL ? 'lg:order-1' : 'lg:order-2'}>
                <div className="space-y-5">
                  {content.featureBullets.slice(0, 4).map((bullet, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-6 transition-all duration-500"
                      style={{
                        backgroundColor: design.primaryColor + '06',
                        transitionDelay: splitReveal.isVisible ? `${i * 100}ms` : '0ms',
                        opacity: splitReveal.isVisible ? 1 : 0,
                        transform: splitReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: design.accentColor }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-base mb-1" style={{ color: design.primaryColor }}>
                            {bullet.title}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ opacity: 0.65 }}>
                            {bullet.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* === TESTIMONIAL === */}
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
            {/* Gallery with scene #3 + original images */}
            <div>
              <ImageGallery
                images={[...(sceneKeys[2] ? [sceneKeys[2]] : []), ...product.imageKeys]}
                enhancedImages={page.enhancedImageKeys}
                productName={product.name}
                accentColor={design.accentColor}
              />
            </div>

            {/* Description + guarantee */}
            <div
              ref={descReveal.ref}
              className={`transition-all duration-700 ${
                descReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
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
