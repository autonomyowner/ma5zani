'use client';

import { MarketingTemplateProps, FORMAT_DIMENSIONS } from './index';

/**
 * Promo Card — Discount-focused, high-conversion ad format.
 * Lifestyle scene as inset photo, large bold price dominating,
 * "SAVE X%" badge, urgency-style CTA. Direct response style.
 */
export function PromoCard({
  productImageUrl,
  sceneImageUrl,
  productName,
  price,
  salePrice,
  headline,
  subheadline,
  ctaText,
  palette,
  format,
  storeName,
}: MarketingTemplateProps) {
  const dim = FORMAT_DIMENSIONS[format];
  const isStory = format === 'story';
  const isFacebook = format === 'facebook';
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;
  const displayPrice = hasDiscount ? salePrice : price;
  const savings = hasDiscount ? price - salePrice! : 0;

  const fs = (base: number) => {
    if (isStory) return base * 1.15;
    if (isFacebook) return base * 0.82;
    return base;
  };

  const hasScene = !!sceneImageUrl;

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, Arial, sans-serif',
        direction: 'rtl',
        background: `linear-gradient(160deg, ${palette.gradientFrom} 0%, ${palette.primaryColor} 100%)`,
      }}
    >
      {/* Multiple diagonal stripes for energy */}
      <div style={{ position: 'absolute', top: -dim.height * 0.15, right: -dim.width * 0.05, width: dim.width * 0.45, height: dim.height * 1.4, background: palette.accentColor, transform: 'rotate(-12deg)', opacity: 0.1 }} />
      <div style={{ position: 'absolute', top: -dim.height * 0.1, right: dim.width * 0.2, width: dim.width * 0.12, height: dim.height * 1.3, background: '#fff', transform: 'rotate(-12deg)', opacity: 0.04 }} />
      <div style={{ position: 'absolute', top: -dim.height * 0.05, left: -dim.width * 0.08, width: dim.width * 0.06, height: dim.height * 1.2, background: palette.accentColor, transform: 'rotate(-12deg)', opacity: 0.06 }} />

      {/* Dot pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {isFacebook ? (
        /* Facebook: horizontal promo */
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 2 }}>
          {/* Left: product with scene inset */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24 }}>
            {/* Scene inset as rounded thumbnail */}
            {hasScene && (
              <div style={{ position: 'absolute', top: 16, left: 16, width: 90, height: 90, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', zIndex: 3 }}>
                <div style={{ width: '100%', height: '100%', backgroundImage: `url(${sceneImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              </div>
            )}
            {productImageUrl && (
              <>
                <div style={{ position: 'absolute', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentColor}20, transparent 65%)`, filter: 'blur(30px)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImageUrl} alt={productName} crossOrigin="anonymous" style={{ maxWidth: '78%', maxHeight: '80%', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.35))', position: 'relative', zIndex: 1 }} />
              </>
            )}
            {hasDiscount && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: palette.accentColor, color: '#fff', padding: '8px 20px', borderRadius: 12, fontSize: fs(28), fontWeight: 900, zIndex: 3, boxShadow: `0 4px 16px ${palette.accentColor}55` }}>
                -{discountPercent}%
              </div>
            )}
          </div>
          {/* Right: price + CTA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 40px' }}>
            <h2 style={{ fontSize: fs(30), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15 }}>{headline}</h2>
            <p style={{ fontSize: fs(15), color: 'rgba(255,255,255,0.7)', margin: '8px 0 20px', lineHeight: 1.5 }}>{subheadline}</p>
            {/* Big price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: fs(56), fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{displayPrice}</span>
              <span style={{ fontSize: fs(24), fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>DA</span>
            </div>
            {hasDiscount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: fs(18), textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)' }}>{price} DA</span>
                <span style={{ fontSize: fs(16), color: palette.accentColor, fontWeight: 700 }}>وفّر {savings} DA</span>
              </div>
            )}
            {ctaText && (
              <div style={{ background: palette.accentColor, color: '#fff', padding: '12px 0', borderRadius: 14, textAlign: 'center', fontSize: fs(20), fontWeight: 800, boxShadow: `0 6px 20px ${palette.accentColor}55` }}>
                {ctaText}
              </div>
            )}
            <p style={{ fontSize: fs(12), color: 'rgba(255,255,255,0.35)', margin: '12px 0 0' }}>{storeName}</p>
          </div>
        </div>
      ) : (
        /* Square / Story: vertical promo card */
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Top: discount badge + headline */}
          <div style={{ padding: isStory ? '72px 56px 20px' : '44px 56px 16px' }}>
            {hasDiscount && (
              <div style={{ display: 'inline-block', background: palette.accentColor, color: '#fff', padding: `${fs(10)}px ${fs(32)}px`, borderRadius: 14, fontSize: fs(46), fontWeight: 900, marginBottom: 16, boxShadow: `0 6px 24px ${palette.accentColor}55`, transform: 'rotate(-1deg)' }}>
                -{discountPercent}%
              </div>
            )}
            <h2 style={{ fontSize: fs(44), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {headline}
            </h2>
            <p style={{ fontSize: fs(22), color: 'rgba(255,255,255,0.75)', margin: '10px 0 0', lineHeight: 1.4 }}>
              {subheadline}
            </p>
          </div>

          {/* Middle: product + scene inset */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 40px' }}>
            {/* Scene as small inset thumbnail */}
            {hasScene && (
              <div style={{ position: 'absolute', top: 0, right: 40, width: isStory ? 130 : 110, height: isStory ? 130 : 110, borderRadius: 20, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)', zIndex: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={{ width: '100%', height: '100%', backgroundImage: `url(${sceneImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              </div>
            )}
            {productImageUrl && (
              <>
                <div style={{ position: 'absolute', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentColor}20, transparent 65%)`, filter: 'blur(40px)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl}
                  alt={productName}
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '82%',
                    maxHeight: isStory ? dim.height * 0.27 : dim.height * 0.34,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25)) drop-shadow(0 24px 48px rgba(0,0,0,0.35))',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </>
            )}
          </div>

          {/* Bottom: price + CTA bar */}
          <div
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)',
              padding: isStory ? '32px 56px 64px' : '28px 56px 44px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Price row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: fs(60), fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{displayPrice}</span>
                <span style={{ fontSize: fs(28), fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>DA</span>
              </div>
              {hasDiscount && (
                <div>
                  <span style={{ fontSize: fs(22), textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)', display: 'block' }}>{price} DA</span>
                  <span style={{ fontSize: fs(18), color: palette.accentColor, fontWeight: 700 }}>وفّر {savings} DA</span>
                </div>
              )}
            </div>
            {/* CTA button */}
            {ctaText && (
              <div style={{ background: palette.accentColor, color: '#fff', padding: `${fs(16)}px 0`, borderRadius: 18, textAlign: 'center', fontSize: fs(26), fontWeight: 800, boxShadow: `0 6px 24px ${palette.accentColor}55` }}>
                {ctaText}
              </div>
            )}
            <p style={{ fontSize: fs(13), color: 'rgba(255,255,255,0.3)', margin: '14px 0 0', textAlign: 'center' }}>{storeName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
