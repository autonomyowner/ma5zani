'use client';

import { MarketingTemplateProps, FORMAT_DIMENSIONS } from './index';

/**
 * Split Scene — Left half shows the lifestyle scene (darkened), right half is
 * clean with floating product + text. Curved divider between them creates
 * a dynamic, modern feel.
 */
export function SplitScene({
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
        background: palette.backgroundColor,
      }}
    >
      {isFacebook ? (
        /* Facebook: horizontal split — scene left, product+text right */
        <>
          {/* Left: scene/gradient zone */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '48%',
              height: '100%',
              background: `linear-gradient(160deg, ${palette.gradientFrom}, ${palette.gradientTo})`,
              clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
            }}
          >
            {hasScene && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${sceneImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, filter: 'blur(1.5px) brightness(0.88)' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
            {/* Text on scene side */}
            <div style={{ position: 'relative', zIndex: 1, padding: '40px 40px 40px 44px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: fs(32), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {headline}
              </h2>
              <p style={{ fontSize: fs(15), color: 'rgba(255,255,255,0.8)', margin: '10px 0 0', lineHeight: 1.5 }}>
                {subheadline}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <div style={{ width: 20, height: 3, background: palette.accentColor, borderRadius: 2 }} />
                <p style={{ fontSize: fs(12), color: 'rgba(255,255,255,0.5)', margin: 0 }}>{storeName}</p>
              </div>
            </div>
          </div>
          {/* Right: product + price */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, zIndex: 1 }}>
            {/* Subtle bg pattern */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${palette.primaryColor}08 1.5px, transparent 1.5px)`, backgroundSize: '24px 24px' }} />
            {productImageUrl && (
              <div style={{ position: 'relative', width: '80%', height: '65%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '55%', height: '55%', borderRadius: '50%', background: `radial-gradient(circle, ${palette.primaryColor}12, transparent 70%)` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImageUrl} alt={productName} crossOrigin="anonymous" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.12))', position: 'relative', zIndex: 1 }} />
              </div>
            )}
            {/* Price badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              {hasDiscount && (
                <span style={{ fontSize: fs(16), textDecoration: 'line-through', color: palette.textColor, opacity: 0.35 }}>{price} DA</span>
              )}
              <div style={{ background: palette.accentColor, padding: '8px 24px', borderRadius: 14, boxShadow: `0 4px 16px ${palette.accentColor}44` }}>
                <span style={{ fontSize: fs(36), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
                <span style={{ fontSize: fs(18), fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginRight: 6 }}> DA</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Square / Story: top scene zone, bottom clean zone with product */
        <>
          {/* Top: scene/gradient zone with curved bottom */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: isStory ? '45%' : '50%',
              background: `linear-gradient(160deg, ${palette.gradientFrom}, ${palette.gradientTo})`,
              clipPath: isStory
                ? 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 90%)'
                : 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 88%)',
            }}
          >
            {hasScene && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${sceneImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75, filter: 'blur(1.5px) brightness(0.9)' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)' }} />

            {/* Text on scene */}
            <div style={{ position: 'relative', zIndex: 1, padding: isStory ? '80px 56px' : '48px 56px' }}>
              {hasDiscount && (
                <div style={{ display: 'inline-block', background: palette.accentColor, color: '#fff', padding: `${fs(6)}px ${fs(20)}px`, borderRadius: 10, fontSize: fs(28), fontWeight: 900, marginBottom: 16, boxShadow: `0 4px 16px ${palette.accentColor}55` }}>
                  -{discountPercent}%
                </div>
              )}
              <h2 style={{ fontSize: fs(48), fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {headline}
              </h2>
              <p style={{ fontSize: fs(22), color: 'rgba(255,255,255,0.8)', margin: '12px 0 0', lineHeight: 1.45 }}>
                {subheadline}
              </p>
            </div>
          </div>

          {/* Bottom: clean zone with product */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: isStory ? '55%' : '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isStory ? '60px 48px 56px' : '40px 48px 40px',
            }}
          >
            {/* Subtle dot pattern */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${palette.primaryColor}08 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />

            {/* Product with studio shadow */}
            {productImageUrl && (
              <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginBottom: 20 }}>
                <div style={{ position: 'absolute', width: '55%', height: '65%', borderRadius: 32, background: `linear-gradient(145deg, ${palette.primaryColor}06, ${palette.accentColor}08)`, transform: 'rotate(-3deg)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageUrl}
                  alt={productName}
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '75%',
                    maxHeight: isStory ? dim.height * 0.24 : dim.height * 0.3,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1)) drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                {/* Surface reflection */}
                <div style={{ width: '45%', height: 18, background: `radial-gradient(ellipse, ${palette.primaryColor}0a, transparent 70%)`, borderRadius: '50%', marginTop: 4, filter: 'blur(5px)' }} />
              </div>
            )}

            {/* Price + CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {hasDiscount && (
                  <span style={{ fontSize: fs(20), textDecoration: 'line-through', color: palette.textColor, opacity: 0.3 }}>{price} DA</span>
                )}
                <div style={{ background: palette.primaryColor, padding: `${fs(10)}px ${fs(28)}px`, borderRadius: 16, boxShadow: `0 6px 20px ${palette.primaryColor}33` }}>
                  <span style={{ fontSize: fs(44), fontWeight: 900, color: '#fff' }}>{displayPrice}</span>
                  <span style={{ fontSize: fs(22), fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginRight: 8 }}> DA</span>
                </div>
              </div>
              {ctaText && (
                <div style={{ background: palette.accentColor, color: '#fff', padding: `${fs(12)}px ${fs(32)}px`, borderRadius: 14, fontSize: fs(22), fontWeight: 800, boxShadow: `0 4px 16px ${palette.accentColor}44` }}>
                  {ctaText}
                </div>
              )}
            </div>

            {/* Store name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, zIndex: 1 }}>
              <div style={{ width: 20, height: 2.5, background: palette.accentColor, borderRadius: 2 }} />
              <p style={{ fontSize: fs(14), color: palette.textColor, opacity: 0.3, margin: 0 }}>{storeName}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
