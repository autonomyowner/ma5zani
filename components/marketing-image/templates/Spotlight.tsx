'use client';

import { MarketingTemplateProps, FORMAT_DIMENSIONS } from './index';

/**
 * Spotlight — Dark/moody background with a radial light spotlight effect.
 * Product centered and large. Minimal text at bottom in a glowing accent bar.
 * Premium luxury feel.
 */
export function Spotlight({
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
        background: '#0a0a0a',
      }}
    >
      {/* Scene image as subtle background texture with depth */}
      {hasScene && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${sceneImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            filter: 'blur(6px) brightness(0.4)',
          }}
        />
      )}

      {/* Radial spotlight from center-top */}
      <div
        style={{
          position: 'absolute',
          top: isStory ? '-5%' : '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: dim.width * 1.2,
          height: dim.width * 1.2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.primaryColor}35 0%, ${palette.primaryColor}10 35%, transparent 65%)`,
        }}
      />

      {/* Secondary accent glow */}
      <div
        style={{
          position: 'absolute',
          bottom: isFacebook ? '-30%' : '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: dim.width * 0.8,
          height: dim.width * 0.4,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accentColor}20 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Fine grain noise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />

      {isFacebook ? (
        /* Facebook: horizontal — product left, text right */
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 2 }}>
          {/* Left: product with spotlight */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {productImageUrl && (
              <>
                <div style={{ position: 'absolute', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.primaryColor}25, transparent 65%)`, filter: 'blur(30px)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl}
                  alt={productName}
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '80%',
                    maxHeight: '85%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35)) drop-shadow(0 24px 48px rgba(0,0,0,0.45))',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </>
            )}
            {hasDiscount && (
              <div style={{ position: 'absolute', top: 20, left: 24, background: palette.accentColor, color: '#fff', padding: '6px 18px', borderRadius: 10, fontSize: fs(24), fontWeight: 900, zIndex: 3, boxShadow: `0 4px 16px ${palette.accentColor}55` }}>
                -{discountPercent}%
              </div>
            )}
          </div>
          {/* Right: text */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 40px' }}>
            <h2 style={{ fontSize: fs(32), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15 }}>
              {headline}
            </h2>
            <p style={{ fontSize: fs(16), color: 'rgba(255,255,255,0.55)', margin: '10px 0 24px', lineHeight: 1.5 }}>
              {subheadline}
            </p>
            {/* Price bar */}
            <div style={{ background: `linear-gradient(135deg, ${palette.primaryColor}, ${palette.gradientTo})`, padding: '12px 28px', borderRadius: 16, display: 'inline-flex', alignItems: 'baseline', gap: 8, alignSelf: 'flex-start', boxShadow: `0 0 30px ${palette.primaryColor}33` }}>
              <span style={{ fontSize: fs(42), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
              <span style={{ fontSize: fs(20), fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>DA</span>
            </div>
            {hasDiscount && (
              <span style={{ fontSize: fs(16), textDecoration: 'line-through', color: 'rgba(255,255,255,0.3)', marginTop: 8, display: 'block' }}>{price} DA</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <div style={{ width: 20, height: 2, background: palette.accentColor, borderRadius: 1 }} />
              <p style={{ fontSize: fs(12), color: 'rgba(255,255,255,0.3)', margin: 0 }}>{storeName}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Square / Story: centered product, bottom bar */
        <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
          {/* Discount badge top-left */}
          {hasDiscount && (
            <div
              style={{
                position: 'absolute',
                top: isStory ? 72 : 44,
                left: 44,
                background: palette.accentColor,
                color: '#fff',
                padding: `${fs(10)}px ${fs(28)}px`,
                borderRadius: 14,
                fontSize: fs(38),
                fontWeight: 900,
                zIndex: 5,
                boxShadow: `0 0 24px ${palette.accentColor}55`,
              }}
            >
              -{discountPercent}%
            </div>
          )}

          {/* Headline at top */}
          <div style={{ position: 'absolute', top: isStory ? 72 : 44, right: 44, left: hasDiscount ? dim.width * 0.4 : 44, zIndex: 3 }}>
            <h2 style={{ fontSize: fs(40), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, textAlign: hasDiscount ? 'left' : 'right' }}>
              {headline}
            </h2>
          </div>

          {/* Product — centered, large with premium studio shadow */}
          {productImageUrl && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: dim.width * 0.78,
                height: isStory ? dim.height * 0.4 : dim.height * 0.48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              {/* Spotlight glow ring */}
              <div style={{ position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.primaryColor}25, transparent 60%)`, filter: 'blur(40px)' }} />
              {/* Accent ring */}
              <div style={{ position: 'absolute', width: '85%', height: '85%', borderRadius: '50%', border: `1px solid ${palette.primaryColor}15` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageUrl}
                alt={productName}
                crossOrigin="anonymous"
                style={{
                  maxWidth: '88%',
                  maxHeight: '88%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4)) drop-shadow(0 30px 60px rgba(0,0,0,0.5)) drop-shadow(0 0 80px rgba(0,0,0,0.2))',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
              {/* Surface reflection glow */}
              <div style={{ width: '50%', height: 20, background: `radial-gradient(ellipse, ${palette.primaryColor}18, transparent 70%)`, borderRadius: '50%', marginTop: 6, filter: 'blur(8px)', position: 'relative', zIndex: 1 }} />
            </div>
          )}

          {/* Bottom: glowing price bar */}
          <div
            style={{
              position: 'absolute',
              bottom: isStory ? 56 : 36,
              left: 36,
              right: 36,
              background: `linear-gradient(135deg, ${palette.primaryColor}ee, ${palette.gradientTo}ee)`,
              borderRadius: 20,
              padding: isStory ? '28px 40px' : '22px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: `0 0 40px ${palette.primaryColor}33, 0 8px 24px rgba(0,0,0,0.3)`,
              border: `1px solid ${palette.primaryColor}44`,
            }}
          >
            <div>
              <p style={{ fontSize: fs(18), color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: 4 }}>{subheadline}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: fs(48), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
                <span style={{ fontSize: fs(22), fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>DA</span>
                {hasDiscount && (
                  <span style={{ fontSize: fs(20), textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>{price}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              {ctaText && (
                <div style={{ background: palette.accentColor, color: '#fff', padding: `${fs(10)}px ${fs(28)}px`, borderRadius: 12, fontSize: fs(20), fontWeight: 800, boxShadow: `0 4px 16px ${palette.accentColor}55` }}>
                  {ctaText}
                </div>
              )}
              <p style={{ fontSize: fs(12), color: 'rgba(255,255,255,0.35)', margin: '8px 0 0', textAlign: 'center' }}>{storeName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
