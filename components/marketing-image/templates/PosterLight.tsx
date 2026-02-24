'use client';

import { PosterTemplateProps, POSTER_DIMENSIONS } from './index';

export function PosterLight({
  productImageUrl,
  sceneImageUrl,
  productName,
  price,
  salePrice,
  copy,
  palette,
  storeName,
}: PosterTemplateProps) {
  const dim = POSTER_DIMENSIONS;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;
  const displayPrice = hasDiscount ? salePrice : price;

  const featureIcons = [
    // Shield
    <svg key="shield" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    // Check circle
    <svg key="check" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    // Truck
    <svg key="truck" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    // Star
    <svg key="star" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ];

  const trustIcons = [
    // Package
    <svg key="pkg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    // Credit card
    <svg key="card" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    // Award
    <svg key="award" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  ];

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, Arial, sans-serif',
        direction: 'rtl',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* === SECTION 1: Hero zone (730px) === */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 730,
          overflow: 'hidden',
        }}
      >
        {/* Scene image background */}
        {sceneImageUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${sceneImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(3px) brightness(0.65)',
            }}
          />
        )}
        {/* Gradient overlay if no scene */}
        {!sceneImageUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(160deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 100%)`,
            }}
          />
        )}
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Hook headline */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 50,
            right: 50,
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: 58,
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.2,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              margin: 0,
            }}
          >
            {copy.hookHeadline}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              lineHeight: 1.4,
              marginTop: 12,
              textShadow: '0 1px 6px rgba(0,0,0,0.3)',
            }}
          >
            {copy.subheadline}
          </p>
        </div>

        {/* Product image floating center */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 420,
            height: 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <img
            src={productImageUrl}
            alt={productName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
            }}
          />
        </div>
      </div>

      {/* === SECTION 2: Problem → Solution (150px) === */}
      <div
        style={{
          height: 150,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '0 50px',
          backgroundColor: '#fafafa',
        }}
      >
        {/* Problem */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            المشكل
          </div>
          <p style={{ fontSize: 22, color: '#374151', lineHeight: 1.4, margin: 0 }}>
            {copy.problem}
          </p>
        </div>

        {/* Arrow divider */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>

        {/* Solution */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#16a34a',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            الحل
          </div>
          <p style={{ fontSize: 22, color: '#374151', lineHeight: 1.4, margin: 0 }}>
            {copy.solution}
          </p>
        </div>
      </div>

      {/* === SECTION 3: Features (340px) === */}
      <div
        style={{
          height: 340,
          padding: '30px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
          backgroundColor: '#ffffff',
        }}
      >
        {copy.features.slice(0, 4).map((feature, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 24px',
              borderRadius: 16,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {featureIcons[i]}
            </div>
            <span style={{ fontSize: 24, color: '#1f2937', fontWeight: 600 }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* === SECTION 4: Price block (200px) === */}
      <div
        style={{
          height: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${palette.primaryColor}12 0%, ${palette.accentColor}12 100%)`,
          gap: 8,
        }}
      >
        {hasDiscount && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                fontSize: 28,
                color: '#9ca3af',
                textDecoration: 'line-through',
                fontWeight: 500,
              }}
            >
              {price.toLocaleString()} DZD
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#dc2626',
                padding: '4px 14px',
                borderRadius: 20,
              }}
            >
              -{discountPercent}%
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: palette.primaryColor,
              lineHeight: 1,
            }}
          >
            {(displayPrice || price).toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: palette.primaryColor,
              opacity: 0.7,
            }}
          >
            DZD
          </span>
        </div>
      </div>

      {/* === SECTION 5: Trust bar (120px) === */}
      <div
        style={{
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          padding: '0 40px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {copy.trustBadges.slice(0, 3).map((badge, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              flex: 1,
            }}
          >
            {trustIcons[i]}
            <span
              style={{
                fontSize: 17,
                color: '#4b5563',
                textAlign: 'center',
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {badge}
            </span>
          </div>
        ))}
      </div>

      {/* === SECTION 6: CTA button (180px) === */}
      <div
        style={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '28px 0',
            borderRadius: 24,
            backgroundColor: palette.accentColor,
            textAlign: 'center',
            boxShadow: `0 8px 24px ${palette.accentColor}44`,
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 1,
            }}
          >
            {copy.ctaText}
          </span>
        </div>
      </div>

      {/* === SECTION 7: Store branding (100px) === */}
      <div
        style={{
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: '#9ca3af',
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {storeName}
        </span>
      </div>
    </div>
  );
}
