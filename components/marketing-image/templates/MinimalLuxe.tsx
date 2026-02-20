'use client';

import { MarketingTemplateProps, FORMAT_DIMENSIONS } from './index';

/**
 * Minimal Luxe — Clean white background, product large and centered with
 * a soft reflection below it, thin accent lines, editorial typography.
 * Apple-style product page feel.
 */
export function MinimalLuxe({
  productImageUrl,
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
  const displayPrice = hasDiscount ? salePrice : price;

  const fs = (base: number) => {
    if (isStory) return base * 1.15;
    if (isFacebook) return base * 0.82;
    return base;
  };

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, Arial, sans-serif',
        direction: 'rtl',
        background: '#ffffff',
      }}
    >
      {/* Elegant double border */}
      <div style={{ position: 'absolute', inset: 20, border: `1.5px solid ${palette.primaryColor}12`, borderRadius: 24, pointerEvents: 'none', zIndex: 3 }} />

      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 80, height: 4, background: palette.accentColor, borderRadius: 2, zIndex: 4 }} />

      {/* Very subtle background gradient blob */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          width: dim.width * 0.7,
          height: dim.width * 0.7,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.primaryColor}05 0%, transparent 70%)`,
        }}
      />

      {isFacebook ? (
        /* Facebook: elegant horizontal split */
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 1 }}>
          {/* Left: product with soft background */}
          {productImageUrl && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 44, background: `linear-gradient(145deg, ${palette.primaryColor}03, ${palette.primaryColor}06)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImageUrl} alt={productName} crossOrigin="anonymous" style={{ maxWidth: '78%', maxHeight: '78%', objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.08))' }} />
            </div>
          )}
          {/* Right: editorial text */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '36px 48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: fs(34), fontWeight: 700, color: palette.textColor, margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              {headline}
            </h2>
            {/* Accent separator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '18px 0' }}>
              <div style={{ width: 32, height: 2, background: palette.accentColor, borderRadius: 1 }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: palette.accentColor, opacity: 0.5 }} />
              <div style={{ width: 32, height: 2, background: palette.accentColor, borderRadius: 1 }} />
            </div>
            <p style={{ fontSize: fs(16), color: palette.textColor, opacity: 0.5, margin: '0 0 24px', lineHeight: 1.5 }}>
              {subheadline}
            </p>
            {/* Price */}
            <p style={{ fontSize: fs(44), fontWeight: 800, color: palette.primaryColor, margin: 0, letterSpacing: '-0.02em' }}>
              {displayPrice} DA
            </p>
            {hasDiscount && (
              <p style={{ fontSize: fs(18), textDecoration: 'line-through', color: palette.textColor, opacity: 0.25, margin: '6px 0 0' }}>{price} DA</p>
            )}
            {ctaText && (
              <div style={{ background: palette.primaryColor, color: '#fff', padding: '10px 0', borderRadius: 12, fontSize: fs(18), fontWeight: 700, marginTop: 20 }}>
                {ctaText}
              </div>
            )}
            <p style={{ fontSize: fs(12), color: palette.textColor, opacity: 0.2, marginTop: 18, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{storeName}</p>
          </div>
        </div>
      ) : (
        /* Square / Story: centered vertical editorial layout */
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isStory ? '100px 64px' : '56px 56px', position: 'relative', zIndex: 1 }}>
          {/* Product image with reflection */}
          {productImageUrl && (
            <div
              style={{
                flex: isStory ? 2 : 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                marginBottom: 12,
                position: 'relative',
              }}
            >
              {/* Soft bg shape */}
              <div style={{ position: 'absolute', width: '60%', height: '70%', borderRadius: 32, background: `linear-gradient(145deg, ${palette.primaryColor}04, ${palette.accentColor}06)` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageUrl}
                alt={productName}
                crossOrigin="anonymous"
                style={{
                  maxWidth: '68%',
                  maxHeight: isStory ? dim.height * 0.32 : dim.height * 0.36,
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.06)) drop-shadow(0 16px 32px rgba(0,0,0,0.1))',
                }}
              />
              {/* Reflection effect — more visible */}
              <div
                style={{
                  width: '45%',
                  height: 32,
                  background: `radial-gradient(ellipse, ${palette.primaryColor}0c, transparent 70%)`,
                  borderRadius: '50%',
                  marginTop: 6,
                  filter: 'blur(5px)',
                }}
              />
            </div>
          )}

          {/* Accent separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 36, height: 2.5, background: palette.accentColor, borderRadius: 2 }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: palette.accentColor, opacity: 0.4 }} />
            <div style={{ width: 36, height: 2.5, background: palette.accentColor, borderRadius: 2 }} />
          </div>

          {/* Text */}
          <h2
            style={{
              fontSize: fs(46),
              fontWeight: 700,
              color: palette.textColor,
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: fs(22),
              color: palette.textColor,
              opacity: 0.45,
              textAlign: 'center',
              margin: '14px 0 30px',
              lineHeight: 1.5,
              maxWidth: '85%',
            }}
          >
            {subheadline}
          </p>

          {/* Price */}
          <p style={{ fontSize: fs(54), fontWeight: 800, color: palette.primaryColor, margin: 0, letterSpacing: '-0.02em' }}>
            {displayPrice} DA
          </p>
          {hasDiscount && (
            <p style={{ fontSize: fs(20), textDecoration: 'line-through', color: palette.textColor, opacity: 0.2, margin: '6px 0 0' }}>{price} DA</p>
          )}

          {/* CTA button */}
          {ctaText && (
            <div
              style={{
                background: palette.primaryColor,
                color: '#fff',
                padding: `${fs(14)}px ${fs(56)}px`,
                borderRadius: 16,
                fontSize: fs(24),
                fontWeight: 700,
                marginTop: 28,
                boxShadow: `0 6px 20px ${palette.primaryColor}25`,
              }}
            >
              {ctaText}
            </div>
          )}

          {/* Store name */}
          <p style={{ fontSize: fs(14), color: palette.textColor, opacity: 0.18, marginTop: isStory ? 44 : 28, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{storeName}</p>
        </div>
      )}
    </div>
  );
}
