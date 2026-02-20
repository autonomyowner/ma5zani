'use client';

import { MarketingTemplateProps, FORMAT_DIMENSIONS } from './index';

/**
 * Lifestyle Hero — Full-bleed lifestyle scene as background with the product
 * overlapping from the side, frosted glass info card, and professional typography.
 * Magazine-ad feel.
 */
export function LifestyleHero({
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

  const bgImage = sceneImageUrl || '';
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
        background: hasScene
          ? `linear-gradient(145deg, ${palette.gradientFrom}, ${palette.gradientTo})`
          : `linear-gradient(145deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 60%, ${palette.primaryColor} 100%)`,
      }}
    >
      {/* Layer 1: Studio background image */}
      {hasScene && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) brightness(0.92)',
          }}
        />
      )}

      {/* Dark overlay for text readability + depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hasScene
            ? 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Decorative accent line — top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: palette.accentColor, zIndex: 5 }} />

      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {isFacebook ? (
        /* Facebook: horizontal — scene left, product+info right */
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 2 }}>
          {/* Left: text content with glass panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 44px', position: 'relative' }}>
            {/* Frosted glass card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '32px 36px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <h2 style={{ fontSize: fs(34), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {headline}
              </h2>
              <p style={{ fontSize: fs(16), color: 'rgba(255,255,255,0.8)', margin: '10px 0 20px', lineHeight: 1.5 }}>
                {subheadline}
              </p>
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ background: palette.accentColor, padding: '8px 24px', borderRadius: 14, boxShadow: `0 6px 20px ${palette.accentColor}55` }}>
                  <span style={{ fontSize: fs(38), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
                  <span style={{ fontSize: fs(18), fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginRight: 6 }}> DA</span>
                </div>
                {hasDiscount && (
                  <span style={{ fontSize: fs(18), textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>{price} DA</span>
                )}
              </div>
            </div>
          </div>
          {/* Right: floating product with studio shadow */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column' }}>
            {productImageUrl && (
              <>
                <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentColor}30, transparent 70%)`, filter: 'blur(40px)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl}
                  alt={productName}
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '82%',
                    maxHeight: '82%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 24px 48px rgba(0,0,0,0.35))',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                {/* Surface reflection */}
                <div style={{ width: '50%', height: 16, background: 'radial-gradient(ellipse, rgba(255,255,255,0.1), transparent 70%)', borderRadius: '50%', marginTop: 4, filter: 'blur(4px)', position: 'relative', zIndex: 1 }} />
              </>
            )}
          </div>
          {/* Store name bottom */}
          <div style={{ position: 'absolute', bottom: 14, left: 44, display: 'flex', alignItems: 'center', gap: 8, zIndex: 3 }}>
            <div style={{ width: 20, height: 3, background: palette.accentColor, borderRadius: 2 }} />
            <p style={{ fontSize: fs(12), color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.06em' }}>{storeName}</p>
          </div>
        </div>
      ) : (
        /* Square / Story: Product floating over scene, info card bottom */
        <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
          {/* Discount badge */}
          {hasDiscount && (
            <div
              style={{
                position: 'absolute',
                top: isStory ? 70 : 44,
                left: 44,
                background: palette.accentColor,
                color: '#fff',
                padding: `${fs(10)}px ${fs(28)}px`,
                borderRadius: 14,
                fontSize: fs(42),
                fontWeight: 900,
                zIndex: 5,
                boxShadow: `0 8px 28px ${palette.accentColor}66`,
                transform: 'rotate(-2deg)',
              }}
            >
              -{discountPercent}%
            </div>
          )}

          {/* Product image — large, centered, floating with studio shadow */}
          {productImageUrl && (
            <div
              style={{
                position: 'absolute',
                top: isStory ? '6%' : '2%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: dim.width * 0.82,
                height: isStory ? dim.height * 0.45 : dim.height * 0.54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accentColor}28, transparent 65%)`, filter: 'blur(50px)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageUrl}
                alt={productName}
                crossOrigin="anonymous"
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 32px 64px rgba(0,0,0,0.4))',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
              {/* Surface reflection */}
              <div
                style={{
                  width: '55%',
                  height: 24,
                  background: `radial-gradient(ellipse, rgba(255,255,255,0.12), transparent 70%)`,
                  borderRadius: '50%',
                  marginTop: 4,
                  filter: 'blur(6px)',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            </div>
          )}

          {/* Bottom frosted glass info card */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 85%, transparent 100%)',
              padding: isStory ? '120px 56px 64px' : '90px 56px 48px',
            }}
          >
            {/* Inner glass card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: 24,
                padding: isStory ? '36px 40px' : '28px 36px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 style={{ fontSize: fs(44), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {headline}
              </h2>
              <p style={{ fontSize: fs(22), color: 'rgba(255,255,255,0.75)', margin: '10px 0 22px', lineHeight: 1.45 }}>
                {subheadline}
              </p>

              {/* Price + CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: palette.accentColor, padding: `${fs(10)}px ${fs(28)}px`, borderRadius: 16, boxShadow: `0 6px 24px ${palette.accentColor}55` }}>
                    <span style={{ fontSize: fs(44), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
                    <span style={{ fontSize: fs(22), fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginRight: 8 }}> DA</span>
                  </div>
                  {hasDiscount && (
                    <span style={{ fontSize: fs(22), textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)' }}>{price} DA</span>
                  )}
                </div>
                {ctaText && (
                  <div
                    style={{
                      background: '#fff',
                      color: palette.primaryColor,
                      padding: `${fs(12)}px ${fs(32)}px`,
                      borderRadius: 14,
                      fontSize: fs(22),
                      fontWeight: 800,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }}
                  >
                    {ctaText}
                  </div>
                )}
              </div>
            </div>

            {/* Store name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <div style={{ width: 24, height: 3, background: palette.accentColor, borderRadius: 2 }} />
              <p style={{ fontSize: fs(15), color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.05em' }}>{storeName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
