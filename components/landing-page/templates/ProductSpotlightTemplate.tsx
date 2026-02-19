'use client'

import { localText } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from '../LandingPageOrderForm'
import StickyOrderBar from '../StickyOrderBar'
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
  const productImgUrl = enhancedKey ? getR2PublicUrl(enhancedKey) : mainOriginalUrl

  const tile1 = sceneKeys[0] ? getR2PublicUrl(sceneKeys[0]) : null
  const tile2 = sceneKeys[1] ? getR2PublicUrl(sceneKeys[1]) : null
  const tile3 = sceneKeys[2] ? getR2PublicUrl(sceneKeys[2]) : null

  const accent = design.accentColor

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ backgroundColor: '#111' }}>
      {/* Dark poster container — narrow, centered */}
      <div className="max-w-[520px] mx-auto" style={{ backgroundColor: '#0a0a0a' }}>

        {/* ====== PANEL 1: SPOTLIGHT HERO ====== */}
        <div className="relative overflow-hidden">
          {/* Top glow line */}
          <div className="h-0.5" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />

          {/* Scarcity badge */}
          {content.scarcityText && (
            <div className="px-5 pt-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: accent + '20', color: accent, boxShadow: `0 0 12px ${accent}15` }}
              >
                {content.scarcityText}
              </span>
            </div>
          )}

          {/* Headline */}
          <div className="px-5 pt-4 pb-3">
            <h1
              className="font-bold leading-tight mb-2"
              style={{
                color: '#f0f0f0',
                fontFamily: 'var(--font-outfit)',
                fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
              }}
            >
              {content.headline}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#f0f0f0', opacity: 0.5 }}>
              {content.subheadline}
            </p>
          </div>

          {/* Scene image or product with radial glow */}
          <div className="relative" style={{ minHeight: '320px' }}>
            {/* Radial glow behind product */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accent}0c 0%, transparent 70%)` }}
            />
            {tile1 ? (
              <img src={tile1} alt={product.name} className="w-full object-cover relative" style={{ maxHeight: '380px' }} />
            ) : productImgUrl ? (
              <div
                className="w-full flex items-center justify-center py-8 px-6 relative"
                style={{ minHeight: '320px' }}
              >
                <img
                  src={productImgUrl}
                  alt={product.name}
                  className="max-h-[280px] object-contain"
                  style={{ filter: `drop-shadow(0 0 40px ${accent}20) drop-shadow(0 16px 40px rgba(0,0,0,0.4))` }}
                />
              </div>
            ) : null}

            {/* Price overlay — glowing on dark */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{ background: 'linear-gradient(to top, #0a0a0a 40%, transparent 100%)' }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span
                      className="text-3xl font-bold"
                      style={{ color: accent, fontFamily: 'var(--font-outfit)', textShadow: `0 0 30px ${accent}40` }}
                    >
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-sm line-through" style={{ color: '#f0f0f0', opacity: 0.3 }}>
                      {product.price.toLocaleString()} DZD
                    </span>
                  </>
                ) : (
                  <span
                    className="text-3xl font-bold"
                    style={{ color: accent, fontFamily: 'var(--font-outfit)', textShadow: `0 0 30px ${accent}40` }}
                  >
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative glow divider */}
        <div className="mx-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}30, transparent)` }} />
        </div>

        {/* ====== PANEL 2: FEATURES ====== */}
        <div className="relative overflow-hidden">
          {/* Scene 2 or product */}
          <div className="relative" style={{ minHeight: '260px' }}>
            {tile2 ? (
              <img src={tile2} alt={product.name} className="w-full object-cover" style={{ maxHeight: '340px' }} />
            ) : productImgUrl ? (
              <div
                className="w-full flex items-center justify-center px-6 py-8"
                style={{ minHeight: '260px' }}
              >
                <img
                  src={productImgUrl}
                  alt={product.name}
                  className="max-h-[220px] object-contain"
                  style={{ filter: `drop-shadow(0 0 30px ${accent}15)`, transform: 'rotate(-4deg)' }}
                />
              </div>
            ) : null}

            {/* Floating feature card on image */}
            {content.featureBullets[0] && (
              <div
                className="absolute bottom-5 left-4 right-4 rounded-xl p-4"
                style={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${accent}15` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: accent + '20', color: accent }}
                  >
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: '#f0f0f0' }}>{content.featureBullets[0].title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#f0f0f0', opacity: 0.5 }}>{content.featureBullets[0].description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* More feature cards below */}
          {content.featureBullets.length > 1 && (
            <div className="px-5 py-5 space-y-3">
              {content.featureBullets.slice(1, 4).map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}10` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: accent + '15', color: accent }}
                    >
                      {i + 2}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5" style={{ color: '#f0f0f0' }}>{bullet.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#f0f0f0', opacity: 0.45 }}>{bullet.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Glow divider */}
        <div className="mx-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}30, transparent)` }} />
        </div>

        {/* ====== PANEL 3: DESCRIPTION + Scene 3 ====== */}
        <div className="relative overflow-hidden">
          <div className="relative" style={{ minHeight: '240px' }}>
            {tile3 ? (
              <img src={tile3} alt={product.name} className="w-full object-cover" style={{ maxHeight: '300px' }} />
            ) : productImgUrl ? (
              <div className="w-full flex items-center justify-center px-6 py-8" style={{ minHeight: '240px' }}>
                <img
                  src={productImgUrl}
                  alt={product.name}
                  className="max-h-[200px] object-contain"
                  style={{ filter: `drop-shadow(0 0 30px ${accent}10)` }}
                />
              </div>
            ) : null}

            {/* Description overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{ background: 'linear-gradient(to top, #0a0a0a 60%, transparent 100%)' }}
            >
              <h2 className="text-lg font-bold mb-2" style={{ color: '#f0f0f0', fontFamily: 'var(--font-outfit)' }}>
                {product.name}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#f0f0f0', opacity: 0.6 }}>
                {content.productDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges — dark neon style */}
        <div className="px-5 py-4 flex flex-wrap justify-center gap-2">
          {[
            localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }),
            localText(language, { ar: '58 ولاية', en: '58 wilayas', fr: '58 wilayas' }),
            localText(language, { ar: 'منتج أصلي', en: 'Authentic', fr: 'Authentique' }),
          ].map((text, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#f0f0f0', opacity: 0.6, border: `1px solid ${accent}15` }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* ====== PANEL 4: FINAL CTA ====== */}
        <div className="px-5 py-8 text-center">
          {content.urgencyText && (
            <p className="text-xs font-medium mb-3" style={{ color: accent }}>{content.urgencyText}</p>
          )}

          {/* Price — large, glowing */}
          <div className="mb-5">
            {hasDiscount ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-sm line-through" style={{ color: '#f0f0f0', opacity: 0.3 }}>
                    {product.price.toLocaleString()} DZD
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: accent + '25', color: accent }}
                  >
                    -{discountPercent}%
                  </span>
                </div>
                <p
                  className="text-3xl sm:text-4xl font-bold"
                  style={{ color: accent, fontFamily: 'var(--font-outfit)', textShadow: `0 0 30px ${accent}30` }}
                >
                  {product.salePrice!.toLocaleString()} <span className="text-lg">DZD</span>
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: accent, opacity: 0.7 }}>
                  {localText(language, {
                    ar: `وفّر ${savingsAmount.toLocaleString()} دج`,
                    en: `Save ${savingsAmount.toLocaleString()} DZD`,
                    fr: `Economisez ${savingsAmount.toLocaleString()} DZD`,
                  })}
                </p>
              </>
            ) : (
              <p
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: accent, fontFamily: 'var(--font-outfit)', textShadow: `0 0 30px ${accent}30` }}
              >
                {product.price.toLocaleString()} <span className="text-lg">DZD</span>
              </p>
            )}
          </div>

          {/* CTA Button — glowing */}
          <button
            onClick={scrollToOrder}
            className="w-full max-w-[280px] py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: accent,
              boxShadow: `0 6px 24px ${accent}50, 0 0 40px ${accent}15`,
            }}
          >
            {content.ctaText}
          </button>

          {/* Guarantee */}
          {content.guaranteeText && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + '20' }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p className="text-[11px]" style={{ color: '#f0f0f0', opacity: 0.45 }}>{content.guaranteeText}</p>
            </div>
          )}

          {/* MicroCopy */}
          {content.microCopy && (
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {[content.microCopy.delivery, content.microCopy.payment, content.microCopy.returns].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: '#f0f0f0', opacity: 0.35 }}>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom glow line */}
        <div className="h-0.5" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />

        {/* ====== ORDER FORM ====== */}
        <div
          className="px-5 py-8 rounded-t-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderTop: `1px solid ${accent}10` }}
        >
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={{ ...design, backgroundColor: 'transparent', textColor: '#f0f0f0' }}
            ctaText={content.ctaText}
          />
        </div>

        {/* Footer */}
        <div className="py-4 text-center text-[11px]" style={{ color: '#f0f0f0', opacity: 0.2 }}>
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
