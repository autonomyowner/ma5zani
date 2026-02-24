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

  const featureColors = [
    { bg: '#EBF5FF', border: '#BFDBFE', icon: '#2563EB' },
    { bg: '#ECFDF5', border: '#A7F3D0', icon: '#059669' },
    { bg: '#FFF7ED', border: '#FED7AA', icon: '#EA580C' },
    { bg: '#F5F3FF', border: '#DDD6FE', icon: '#7C3AED' },
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
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* === TOP BANNER (0-80): Store name + Best Seller badge === */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(135deg, ${palette.primaryColor} 0%, ${palette.accentColor} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: '6px 16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>الأكثر مبيعا</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
          {storeName}
        </span>
      </div>

      {/* === BEFORE/AFTER HERO (80-530) === */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          height: 450,
          display: 'flex',
        }}
      >
        {/* بعد (After) — clean product */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f4f8',
            borderLeft: '2px solid #e5e7eb',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              backgroundColor: palette.primaryColor,
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              padding: '5px 18px',
              borderRadius: 10,
              zIndex: 5,
            }}
          >
            بعد
          </div>
          <img
            src={productImageUrl}
            alt={productName}
            style={{
              maxWidth: '82%',
              maxHeight: '82%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.18))',
            }}
          />
        </div>

        {/* قبل (Before) — scene/lifestyle */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              backgroundColor: '#6b7280',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              padding: '5px 18px',
              borderRadius: 10,
              zIndex: 5,
            }}
          >
            قبل
          </div>
          {sceneImageUrl ? (
            <img
              src={sceneImageUrl}
              alt="lifestyle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={productImageUrl}
                alt={productName}
                style={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain', opacity: 0.6 }}
              />
            </div>
          )}
        </div>

        {/* Discount badge floating */}
        {hasDiscount && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(220,38,38,0.5)',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              {discountPercent}%
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              تخفيض
            </span>
          </div>
        )}
      </div>

      {/* === TRUST BAR (530-610) === */}
      <div
        style={{
          position: 'absolute',
          top: 530,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(135deg, ${palette.primaryColor}10 0%, ${palette.accentColor}10 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          borderTop: `2px solid ${palette.primaryColor}20`,
          borderBottom: `2px solid ${palette.primaryColor}20`,
        }}
      >
        {hasDiscount && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            عرض خاص • خصم {discountPercent}%
          </div>
        )}
        {copy.trustBadges.slice(0, 3).map((badge, i) => {
          const icons = [
            <svg key="b1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
            <svg key="b2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
            <svg key="b3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
          ];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#fff',
                padding: '7px 12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
              }}
            >
              {icons[i]}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{badge}</span>
            </div>
          );
        })}
      </div>

      {/* === HEADLINE + STARS (610-830) === */}
      <div
        style={{
          position: 'absolute',
          top: 610,
          left: 45,
          right: 45,
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: '28px 24px 22px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: palette.primaryColor,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {copy.hookHeadline}
        </h1>
        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: '#6b7280',
            marginTop: 10,
            lineHeight: 1.4,
          }}
        >
          {copy.subheadline}
        </p>
        {/* Star rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 14,
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span style={{ fontSize: 15, color: '#9ca3af', marginRight: 8, fontWeight: 500 }}>
            أكثر من 500 مبيعة
          </span>
        </div>
      </div>

      {/* === FEATURES 2x2 (860-1170) === */}
      <div
        style={{
          position: 'absolute',
          top: 860,
          left: 45,
          right: 45,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}
      >
        {copy.features.slice(0, 4).map((feature, i) => (
          <div
            key={i}
            style={{
              padding: '20px 16px',
              borderRadius: 18,
              backgroundColor: featureColors[i].bg,
              border: `2px solid ${featureColors[i].border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: featureColors[i].border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span
              style={{
                fontSize: 20,
                color: '#1f2937',
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* === PRODUCT + PRICE SHOWCASE (1180-1500) === */}
      <div
        style={{
          position: 'absolute',
          top: 1180,
          left: 45,
          right: 45,
          height: 320,
          borderRadius: 24,
          background: `linear-gradient(160deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 60%, #ffffff 100%)`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Product image — left side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <img
            src={productImageUrl}
            alt={productName}
            style={{
              maxWidth: '90%',
              maxHeight: 280,
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
            }}
          />
        </div>

        {/* Price — right side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {hasDiscount && (
            <span
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'line-through',
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {price.toLocaleString()} DZD
            </span>
          )}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: '20px 30px',
              textAlign: 'center',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: palette.primaryColor,
                  lineHeight: 1,
                }}
              >
                {(displayPrice || price).toLocaleString()}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#9ca3af' }}>دج</span>
            </div>
          </div>
          {hasDiscount && (
            <div
              style={{
                marginTop: 10,
                padding: '6px 16px',
                borderRadius: 10,
                backgroundColor: '#dc2626',
                color: '#fff',
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              وفّر {discountPercent}%
            </div>
          )}
        </div>
      </div>

      {/* === PROBLEM → SOLUTION (1510-1680) === */}
      <div
        style={{
          position: 'absolute',
          top: 1510,
          left: 45,
          right: 45,
          display: 'flex',
          gap: 14,
        }}
      >
        {/* Problem */}
        <div
          style={{
            flex: 1,
            padding: '22px 18px',
            borderRadius: 20,
            backgroundColor: '#FEF2F2',
            border: '2px solid #FECACA',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <p style={{ fontSize: 20, color: '#991B1B', lineHeight: 1.45, margin: 0, fontWeight: 700 }}>
            {copy.problem}
          </p>
        </div>

        {/* Solution */}
        <div
          style={{
            flex: 1,
            padding: '22px 18px',
            borderRadius: 20,
            backgroundColor: '#F0FDF4',
            border: '2px solid #BBF7D0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: 20, color: '#166534', lineHeight: 1.45, margin: 0, fontWeight: 700 }}>
            {copy.solution}
          </p>
        </div>
      </div>

      {/* === CTA BUTTON (1700-1820) === */}
      <div
        style={{
          position: 'absolute',
          top: 1700,
          left: 45,
          right: 45,
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '28px 0',
            borderRadius: 22,
            backgroundColor: palette.accentColor,
            textAlign: 'center',
            boxShadow: `0 8px 30px ${palette.accentColor}50, 0 2px 8px ${palette.accentColor}30`,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 900, color: '#ffffff', letterSpacing: 1 }}>
            {copy.ctaText}
          </span>
        </div>
      </div>

      {/* === FOOTER (1830-1920) === */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>توصيل لكل 58 ولاية</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>الدفع عند الاستلام</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>ضمان الجودة</span>
          </div>
        </div>
        <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 600, letterSpacing: 2 }}>
          {storeName}
        </span>
      </div>
    </div>
  );
}
