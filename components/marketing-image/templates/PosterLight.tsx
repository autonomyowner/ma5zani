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

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, Arial, sans-serif',
        direction: 'rtl',
        background: `linear-gradient(175deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 35%, #ffffff 35.5%)`,
      }}
    >
      {/* === TOP COLORED ZONE — scene + product hero === */}
      {/* Scene image fills top portion */}
      {sceneImageUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 820,
            backgroundImage: `url(${sceneImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {/* Gradient vignette over scene */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 820,
          background: sceneImageUrl
            ? `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.05) 50%, rgba(255,255,255,0.6) 80%, #ffffff 100%)`
            : `linear-gradient(180deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 50%, rgba(255,255,255,0.8) 80%, #ffffff 100%)`,
          zIndex: 1,
        }}
      />

      {/* Decorative blob top-right */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accentColor}25 0%, transparent 70%)`,
          zIndex: 2,
        }}
      />

      {/* === HEADLINE — top of poster === */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 60,
          right: 60,
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          {copy.hookHeadline}
        </h1>
        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.4,
            marginTop: 14,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {copy.subheadline}
        </p>
      </div>

      {/* === PRODUCT IMAGE — large, overlapping the boundary === */}
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Soft colored circle behind product */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.primaryColor}18 0%, ${palette.primaryColor}06 60%, transparent 80%)`,
          }}
        />
        <img
          src={productImageUrl}
          alt={productName}
          style={{
            maxWidth: '92%',
            maxHeight: '92%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.22)) drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
          }}
        />
      </div>

      {/* === DISCOUNT BADGE — floating top-left === */}
      {hasDiscount && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            left: 55,
            zIndex: 15,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#dc2626',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {discountPercent}%
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
            تخفيض
          </span>
        </div>
      )}

      {/* === WHITE CONTENT ZONE (from ~750px down) === */}
      <div
        style={{
          position: 'absolute',
          top: 750,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#ffffff',
          zIndex: 5,
        }}
      >
        {/* Problem → Solution card */}
        <div
          style={{
            margin: '30px 55px 0',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex' }}>
            {/* Problem half */}
            <div
              style={{
                flex: 1,
                padding: '24px 20px',
                backgroundColor: '#fef2f2',
                borderRight: '2px solid #fecaca',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <p style={{ fontSize: 21, color: '#991b1b', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                {copy.problem}
              </p>
            </div>
            {/* Solution half */}
            <div
              style={{
                flex: 1,
                padding: '24px 20px',
                backgroundColor: '#f0fdf4',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: 21, color: '#166534', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                {copy.solution}
              </p>
            </div>
          </div>
        </div>

        {/* Features — 2x2 grid cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            margin: '24px 55px 0',
          }}
        >
          {copy.features.slice(0, 4).map((feature, i) => (
            <div
              key={i}
              style={{
                padding: '20px 18px',
                borderRadius: 20,
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${palette.primaryColor}10`,
                  border: `1.5px solid ${palette.primaryColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 21, color: '#1e293b', fontWeight: 600, lineHeight: 1.3 }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Price section */}
        <div
          style={{
            margin: '28px 55px 0',
            padding: '28px 30px',
            borderRadius: 24,
            background: `linear-gradient(135deg, ${palette.primaryColor} 0%, ${palette.gradientTo} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 8px 30px ${palette.primaryColor}30`,
          }}
        >
          <div>
            {hasDiscount && (
              <span
                style={{
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: 2,
                }}
              >
                {price.toLocaleString()} DZD
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 60, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {(displayPrice || price).toLocaleString()}
              </span>
              <span style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                DZD
              </span>
            </div>
          </div>
          {hasDiscount && (
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
                وفّر {discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Trust badges row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 30,
            margin: '22px 55px 0',
          }}
        >
          {copy.trustBadges.slice(0, 3).map((badge, i) => {
            const icons = [
              <svg key="t1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
              <svg key="t2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              <svg key="t3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
            ];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icons[i]}
                <span style={{ fontSize: 17, color: '#64748b', fontWeight: 500 }}>{badge}</span>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <div style={{ margin: '28px 55px 0' }}>
          <div
            style={{
              width: '100%',
              padding: '26px 0',
              borderRadius: 22,
              backgroundColor: palette.accentColor,
              textAlign: 'center',
              boxShadow: `0 10px 30px ${palette.accentColor}40, 0 2px 6px ${palette.accentColor}30`,
            }}
          >
            <span style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: 1 }}>
              {copy.ctaText}
            </span>
          </div>
        </div>

        {/* Store branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 600, letterSpacing: 2 }}>
            {storeName}
          </span>
        </div>
      </div>
    </div>
  );
}
