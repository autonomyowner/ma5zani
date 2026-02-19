'use client'

import { localText } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from '../LandingPageOrderForm'
import StickyOrderBar from '../StickyOrderBar'
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
  const productImg = enhancedKey ? getR2PublicUrl(enhancedKey) : mainOriginalUrl

  const scene1 = sceneKeys[0] ? getR2PublicUrl(sceneKeys[0]) : null
  const scene2 = sceneKeys[1] ? getR2PublicUrl(sceneKeys[1]) : null
  const scene3 = sceneKeys[2] ? getR2PublicUrl(sceneKeys[2]) : null

  const accent = design.accentColor
  const primary = design.primaryColor
  const bg1 = design.gradientFrom || primary
  const bg2 = design.gradientTo || accent

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: '#eae6e0' }}>
      {/* Editorial poster — narrow, centered, magazine-style */}
      <div className="max-w-[520px] mx-auto" style={{ backgroundColor: design.backgroundColor }}>

        {/* ====== PANEL 1: EDITORIAL HERO — Big typography + scene ====== */}
        <div className="relative overflow-hidden">
          {/* Top bar accent */}
          <div className="h-1.5" style={{ background: `linear-gradient(to right, ${accent}, ${bg1}, ${accent})` }} />

          {/* Scarcity tag */}
          {content.scarcityText && (
            <div className="px-5 pt-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: accent + '18', color: accent, letterSpacing: '0.12em' }}
              >
                {content.scarcityText}
              </span>
            </div>
          )}

          {/* Magazine headline — oversized */}
          <div className="px-5 pt-4 pb-3">
            <h1
              className="font-bold leading-[0.95] mb-2"
              style={{
                color: design.primaryColor,
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.8rem, 8vw, 2.8rem)',
                letterSpacing: '-0.02em',
              }}
            >
              {content.headline}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: design.textColor, opacity: 0.6, maxWidth: '30ch' }}>
              {content.subheadline}
            </p>
          </div>

          {/* Scene image or product — full width, editorial crop */}
          <div className="relative">
            {scene1 ? (
              <img src={scene1} alt={product.name} className="w-full object-cover" style={{ maxHeight: '400px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-center justify-center py-8 px-6"
                style={{ background: `linear-gradient(160deg, ${bg1}15 0%, ${bg2}08 100%)`, minHeight: '320px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[280px] object-contain"
                  style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.12))' }}
                />
              </div>
            ) : null}

            {/* Price overlay at bottom of hero image */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{ background: `linear-gradient(to top, ${design.backgroundColor}f0 40%, transparent 100%)` }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl font-bold" style={{ color: accent, fontFamily: 'var(--font-outfit)' }}>
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-sm line-through" style={{ color: design.textColor, opacity: 0.35 }}>
                      {product.price.toLocaleString()} DZD
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: accent + '20', color: accent }}
                    >
                      -{discountPercent}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold" style={{ color: accent, fontFamily: 'var(--font-outfit)' }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative editorial divider — thin line with number */}
        <div className="mx-5 flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ backgroundColor: primary + '15' }} />
          <span className="text-[9px] font-bold tracking-widest" style={{ color: primary, opacity: 0.3 }}>01</span>
          <div className="flex-1 h-px" style={{ backgroundColor: primary + '15' }} />
        </div>

        {/* ====== PANEL 2: BENEFITS — Editorial numbered list ====== */}
        <div className="relative overflow-hidden">
          {/* Scene 2 or product */}
          <div className="relative" style={{ minHeight: '260px' }}>
            {scene2 ? (
              <img src={scene2} alt={product.name} className="w-full object-cover" style={{ maxHeight: '340px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-end justify-center px-6 pt-8 pb-4"
                style={{ background: `linear-gradient(180deg, ${design.backgroundColor} 0%, ${bg1}08 100%)`, minHeight: '260px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[220px] object-contain"
                  style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.1))', transform: 'rotate(-3deg)' }}
                />
              </div>
            ) : null}
          </div>

          {/* Editorial numbered benefits */}
          {content.featureBullets.length > 0 && (
            <div className="px-5 py-5 space-y-5">
              {content.featureBullets.slice(0, 4).map((bullet, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span
                    className="text-2xl font-bold flex-shrink-0 leading-none"
                    style={{ color: accent, opacity: 0.35, fontFamily: 'var(--font-outfit)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}>
                      {bullet.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: design.textColor, opacity: 0.55 }}>
                      {bullet.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative divider */}
        <div className="mx-5 flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ backgroundColor: primary + '15' }} />
          <span className="text-[9px] font-bold tracking-widest" style={{ color: primary, opacity: 0.3 }}>02</span>
          <div className="flex-1 h-px" style={{ backgroundColor: primary + '15' }} />
        </div>

        {/* ====== PANEL 3: DESCRIPTION + Scene 3 ====== */}
        <div className="relative overflow-hidden">
          <div className="relative" style={{ minHeight: '240px' }}>
            {scene3 ? (
              <img src={scene3} alt={product.name} className="w-full object-cover" style={{ maxHeight: '300px' }} />
            ) : productImg ? (
              <div
                className="w-full flex items-center justify-center px-6 py-8"
                style={{ background: `linear-gradient(200deg, ${bg2}10 0%, ${design.backgroundColor} 100%)`, minHeight: '240px' }}
              >
                <img
                  src={productImg}
                  alt={product.name}
                  className="max-h-[200px] object-contain"
                  style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.08))' }}
                />
              </div>
            ) : null}

            {/* Description overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{ background: `linear-gradient(to top, ${design.backgroundColor} 60%, transparent 100%)` }}
            >
              <h2 className="text-lg font-bold mb-2" style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}>
                {product.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: design.textColor, opacity: 0.7 }}>
                {content.productDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges — editorial style */}
        <div className="px-5 py-4 flex flex-wrap justify-center gap-2">
          {[
            localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }),
            localText(language, { ar: '58 ولاية', en: '58 wilayas', fr: '58 wilayas' }),
            localText(language, { ar: 'منتج أصلي', en: 'Authentic', fr: 'Authentique' }),
          ].map((text, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: primary + '08', color: design.textColor, opacity: 0.6, border: `1px solid ${primary}12` }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* ====== PANEL 4: CTA + FINAL PRICING ====== */}
        <div
          className="px-5 py-8 text-center"
          style={{ background: `linear-gradient(180deg, ${design.backgroundColor} 0%, ${bg1}08 100%)` }}
        >
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
            style={{ backgroundColor: accent, boxShadow: `0 6px 20px ${accent}40` }}
          >
            {content.ctaText}
          </button>

          {/* Guarantee */}
          {content.guaranteeText && (
            <p className="mt-3 text-[11px]" style={{ color: design.textColor, opacity: 0.45 }}>
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

        {/* Bottom accent bar */}
        <div className="h-1.5" style={{ background: `linear-gradient(to right, ${accent}, ${bg1}, ${accent})` }} />

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
