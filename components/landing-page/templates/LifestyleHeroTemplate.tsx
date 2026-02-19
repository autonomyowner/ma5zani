'use client'

import { localText } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from '../LandingPageOrderForm'
import StickyOrderBar from '../StickyOrderBar'
import { V3TemplateProps } from './types'

export default function LifestyleHeroTemplate({ page, product, storefront, language, isRTL }: V3TemplateProps) {
  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const savingsAmount = hasDiscount ? product.price - product.salePrice! : 0

  const sceneKeys = page.sceneImageKeys || []
  const enhancedKey = page.enhancedImageKeys?.[0]
  const mainOriginalUrl = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null
  const productImg = enhancedKey ? getR2PublicUrl(enhancedKey) : mainOriginalUrl

  // Scene tile images
  const scene1 = sceneKeys[0] ? getR2PublicUrl(sceneKeys[0]) : null
  const scene2 = sceneKeys[1] ? getR2PublicUrl(sceneKeys[1]) : null
  const scene3 = sceneKeys[2] ? getR2PublicUrl(sceneKeys[2]) : null

  // Derive warm poster palette from design colors
  const bg1 = design.gradientFrom || design.primaryColor
  const bg2 = design.gradientTo || design.accentColor
  const accent = design.accentColor

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: '#f5f0ea' }}>
      {/* Poster container — narrow, centered, like a phone poster */}
      <div className="max-w-[520px] mx-auto" style={{ backgroundColor: design.backgroundColor }}>

        {/* ====== PANEL 1: HERO — Scene + Headline ====== */}
        <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${bg1}15 0%, ${bg2}10 100%)` }}>
          {/* Decorative corner ornament */}
          <div className="absolute top-3 right-3 w-16 h-16" style={{ opacity: 0.15 }}>
            <svg viewBox="0 0 60 60" fill="none"><path d="M0 0h60v60" stroke={accent} strokeWidth="1.5" /><path d="M10 0h50v50" stroke={accent} strokeWidth="1" /></svg>
          </div>
          <div className="absolute top-3 left-3 w-16 h-16" style={{ opacity: 0.15, transform: 'scaleX(-1)' }}>
            <svg viewBox="0 0 60 60" fill="none"><path d="M0 0h60v60" stroke={accent} strokeWidth="1.5" /><path d="M10 0h50v50" stroke={accent} strokeWidth="1" /></svg>
          </div>

          {/* "New" badge */}
          {content.scarcityText && (
            <div className="absolute top-4 right-4 z-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[10px] font-bold leading-tight text-center"
                style={{ backgroundColor: accent, boxShadow: `0 4px 12px ${accent}40` }}
              >
                {content.scarcityText.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
          )}

          {/* Scene image or product on gradient */}
          <div className="relative" style={{ minHeight: '320px' }}>
            {scene1 ? (
              <img src={scene1} alt={product.name} className="w-full object-cover" style={{ maxHeight: '380px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-center justify-center py-8 px-6"
                style={{ background: `linear-gradient(160deg, ${bg1}20 0%, ${bg2}12 100%)`, minHeight: '320px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[280px] object-contain"
                  style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.15))' }}
                />
              </div>
            ) : null}
          </div>

          {/* Headline overlay — positioned at bottom of hero image */}
          <div className="px-5 py-6" style={{ background: `linear-gradient(to bottom, transparent, ${design.backgroundColor}ee)` }}>
            <h1
              className="font-bold leading-tight mb-2"
              style={{
                color: design.primaryColor,
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.4rem, 5.5vw, 2rem)',
              }}
            >
              {content.headline}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: design.textColor, opacity: 0.7 }}>
              {content.subheadline}
            </p>
          </div>
        </div>

        {/* Thin decorative line */}
        <div className="mx-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: accent + '25' }} />
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: accent + '40' }} />
          <div className="flex-1 h-px" style={{ backgroundColor: accent + '25' }} />
        </div>

        {/* ====== PANEL 2: BENEFITS — Scene + Feature text ====== */}
        <div className="relative overflow-hidden">
          {/* Scene 2 or product in different position */}
          <div className="relative" style={{ minHeight: '280px' }}>
            {scene2 ? (
              <img src={scene2} alt={product.name} className="w-full object-cover" style={{ maxHeight: '340px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-end justify-center px-6 pt-8 pb-4"
                style={{ background: `linear-gradient(180deg, ${design.backgroundColor} 0%, ${bg1}12 100%)`, minHeight: '280px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[240px] object-contain"
                  style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.12))', transform: 'rotate(-5deg)' }}
                />
              </div>
            ) : null}

            {/* Floating benefit text ON the image */}
            {content.featureBullets[0] && (
              <div
                className="absolute bottom-6 left-5 right-5 rounded-xl p-4"
                style={{ backgroundColor: design.backgroundColor + 'e8', backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <div>
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: design.primaryColor }}>{content.featureBullets[0].title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: design.textColor, opacity: 0.65 }}>{content.featureBullets[0].description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* More benefits below the image */}
          {content.featureBullets.length > 1 && (
            <div className="px-5 py-5 space-y-4">
              {content.featureBullets.slice(1, 4).map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: accent + '60' }} />
                  <div>
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: design.primaryColor }}>{bullet.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: design.textColor, opacity: 0.6 }}>{bullet.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative line */}
        <div className="mx-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: accent + '25' }} />
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: accent + '40' }} />
          <div className="flex-1 h-px" style={{ backgroundColor: accent + '25' }} />
        </div>

        {/* ====== PANEL 3: PRODUCT DESCRIPTION + Scene 3 ====== */}
        <div className="relative overflow-hidden">
          {/* Scene 3 or product in third position */}
          <div className="relative" style={{ minHeight: '260px' }}>
            {scene3 ? (
              <img src={scene3} alt={product.name} className="w-full object-cover" style={{ maxHeight: '320px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-center justify-center px-6 py-8"
                style={{ background: `linear-gradient(200deg, ${bg2}15 0%, ${design.backgroundColor} 100%)`, minHeight: '260px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[220px] object-contain"
                  style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.1))', transform: 'scale(0.9)' }}
                />
              </div>
            ) : null}

            {/* Description overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{ background: `linear-gradient(to top, ${design.backgroundColor} 60%, transparent 100%)` }}
            >
              <p className="text-sm leading-relaxed" style={{ color: design.textColor, opacity: 0.75 }}>
                {content.productDescription}
              </p>
            </div>
          </div>
        </div>

        {/* ====== PANEL 4: PRICE + CTA + Trust ====== */}
        <div
          className="px-5 py-8 text-center"
          style={{ background: `linear-gradient(180deg, ${design.backgroundColor} 0%, ${bg1}12 100%)` }}
        >
          {/* Urgency text */}
          {content.urgencyText && (
            <p className="text-xs font-medium mb-3" style={{ color: accent }}>{content.urgencyText}</p>
          )}

          {/* Price display */}
          <div className="mb-4">
            {hasDiscount ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-sm line-through" style={{ color: design.textColor, opacity: 0.4 }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    -{discountPercent}%
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold" style={{ color: accent, fontFamily: 'var(--font-outfit)' }}>
                  {product.salePrice!.toLocaleString()} <span className="text-lg">DZD</span>
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: accent, opacity: 0.8 }}>
                  {localText(language, {
                    ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                    en: `Save ${savingsAmount.toLocaleString()} DZD`,
                    fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                  })}
                </p>
              </>
            ) : (
              <p className="text-3xl sm:text-4xl font-bold" style={{ color: accent, fontFamily: 'var(--font-outfit)' }}>
                {product.price.toLocaleString()} <span className="text-lg">DZD</span>
              </p>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={scrollToOrder}
            className="w-full max-w-[280px] py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: accent,
              boxShadow: `0 6px 20px ${accent}40`,
            }}
          >
            {content.ctaText}
          </button>

          {/* Trust line */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: design.textColor, opacity: 0.5 }}>
            <span>{localText(language, { ar: 'التوصيل متوفر ل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' })}</span>
          </div>

          {/* Guarantee */}
          {content.guaranteeText && (
            <p className="mt-2 text-[11px]" style={{ color: design.textColor, opacity: 0.45 }}>
              {content.guaranteeText}
            </p>
          )}

          {/* MicroCopy */}
          {content.microCopy && (
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {[content.microCopy.delivery, content.microCopy.payment, content.microCopy.returns].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: design.textColor, opacity: 0.45 }}>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accent + '60' }} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="h-1" style={{ background: `linear-gradient(to right, ${accent}40, ${accent}, ${accent}40)` }} />

        {/* ====== ORDER FORM ====== */}
        <div className="px-5 py-8" style={{ backgroundColor: design.backgroundColor }}>
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={design}
            ctaText={content.ctaText}
          />
        </div>

        {/* Footer */}
        <div className="py-4 text-center text-[11px]" style={{ color: design.textColor, opacity: 0.3, borderTop: `1px solid ${design.textColor}10` }}>
          {storefront.boutiqueName}
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <StickyOrderBar
        price={product.price}
        salePrice={product.salePrice}
        ctaText={content.ctaText}
        accentColor={accent}
        onOrderClick={scrollToOrder}
      />
    </div>
  )
}
