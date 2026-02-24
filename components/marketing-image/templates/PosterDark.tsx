'use client';

import { PosterTemplateProps, POSTER_DIMENSIONS } from './index';

export function PosterDark({
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

  const glow = palette.accentColor;
  const primary = palette.primaryColor;

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Cairo, Arial, sans-serif',
        direction: 'rtl',
        backgroundColor: '#060608',
      }}
    >
      {/* === BACKGROUND LAYERS === */}
      {/* Scene image — very dark, desaturated */}
      {sceneImageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${sceneImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.15) saturate(0.4) blur(2px)',
          }}
        />
      )}
      {/* Radial spotlight from center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 45% at 50% 38%, ${primary}15 0%, transparent 70%)`,
        }}
      />
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom glow accent */}
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* === HEADLINE — top === */}
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
        {/* Thin accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            borderRadius: 2,
            background: glow,
            margin: '0 auto 20px',
            boxShadow: `0 0 12px ${glow}66`,
          }}
        />
        <h1
          style={{
            fontSize: 62,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: 0,
            textShadow: `0 0 50px ${primary}30, 0 2px 8px rgba(0,0,0,0.6)`,
          }}
        >
          {copy.hookHeadline}
        </h1>
        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.4,
            marginTop: 14,
          }}
        >
          {copy.subheadline}
        </p>
      </div>

      {/* === PRODUCT IMAGE — dramatic center with glow ring === */}
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
        {/* Glow ring behind product */}
        <div
          style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            border: `2px solid ${primary}20`,
            boxShadow: `0 0 60px ${primary}15, inset 0 0 60px ${primary}08`,
          }}
        />
        {/* Inner glow */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${primary}12 0%, transparent 70%)`,
          }}
        />
        <img
          src={productImageUrl}
          alt={productName}
          style={{
            maxWidth: '88%',
            maxHeight: '88%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            filter: `drop-shadow(0 0 50px ${glow}20) drop-shadow(0 20px 40px rgba(0,0,0,0.5))`,
          }}
        />
      </div>

      {/* === DISCOUNT BADGE — floating === */}
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
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(220,38,38,0.5), 0 0 0 3px rgba(220,38,38,0.15)',
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {discountPercent}%
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            تخفيض
          </span>
        </div>
      )}

      {/* === CONTENT ZONE (from ~740px down) === */}
      <div
        style={{
          position: 'absolute',
          top: 750,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
        }}
      >
        {/* Problem → Solution glass card */}
        <div
          style={{
            margin: '24px 55px 0',
            borderRadius: 22,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex' }}>
            {/* Problem */}
            <div
              style={{
                flex: 1,
                padding: '22px 20px',
                backgroundColor: 'rgba(220,38,38,0.08)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(220,38,38,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <p style={{ fontSize: 20, color: '#fca5a5', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                {copy.problem}
              </p>
            </div>
            {/* Solution */}
            <div
              style={{
                flex: 1,
                padding: '22px 20px',
                backgroundColor: 'rgba(22,163,106,0.08)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(22,163,106,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: 20, color: '#86efac', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                {copy.solution}
              </p>
            </div>
          </div>
        </div>

        {/* Features — 2x2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            margin: '20px 55px 0',
          }}
        >
          {copy.features.slice(0, 4).map((feature, i) => (
            <div
              key={i}
              style={{
                padding: '18px 16px',
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: `${primary}12`,
                  border: `1px solid ${primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, color: '#d1d5db', fontWeight: 600, lineHeight: 1.3 }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Price section — glass card */}
        <div
          style={{
            margin: '24px 55px 0',
            padding: '24px 28px',
            borderRadius: 22,
            background: `linear-gradient(135deg, ${primary}20 0%, ${glow}10 100%)`,
            border: `1px solid ${primary}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 0 40px ${primary}10`,
          }}
        >
          <div>
            {hasDiscount && (
              <span
                style={{
                  fontSize: 20,
                  color: 'rgba(255,255,255,0.4)',
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
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1,
                  textShadow: `0 0 20px ${primary}30`,
                }}
              >
                {(displayPrice || price).toLocaleString()}
              </span>
              <span style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                DZD
              </span>
            </div>
          </div>
          {hasDiscount && (
            <div
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                background: 'rgba(220,38,38,0.2)',
                border: '1px solid rgba(220,38,38,0.3)',
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fca5a5' }}>
                وفّر {discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 28,
            margin: '20px 55px 0',
          }}
        >
          {copy.trustBadges.slice(0, 3).map((badge, i) => {
            const icons = [
              <svg key="t1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
              <svg key="t2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              <svg key="t3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
            ];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {icons[i]}
                <span style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>{badge}</span>
              </div>
            );
          })}
        </div>

        {/* CTA button — neon glow */}
        <div style={{ margin: '24px 55px 0' }}>
          <div
            style={{
              width: '100%',
              padding: '24px 0',
              borderRadius: 20,
              backgroundColor: glow,
              textAlign: 'center',
              boxShadow: `0 0 50px ${glow}30, 0 10px 30px ${glow}25, 0 0 0 1px ${glow}40`,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', letterSpacing: 1 }}>
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
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span style={{ fontSize: 18, color: '#374151', fontWeight: 600, letterSpacing: 2 }}>
            {storeName}
          </span>
        </div>
      </div>
    </div>
  );
}
