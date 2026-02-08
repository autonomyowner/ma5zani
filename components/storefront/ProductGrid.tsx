'use client';

import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Doc<'products'>[];
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  productsPerRow?: number;
  title?: string;
  titleAr?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

import { isLightColor } from '@/lib/colors';

export default function ProductGrid({
  products,
  accentColor,
  backgroundColor = '#0a0a0a',
  textColor = '#f5f5dc',
  productsPerRow = 4,
  title,
  titleAr,
  searchQuery = '',
  onSearchChange,
}: ProductGridProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const isLightBg = isLightColor(backgroundColor);
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  const displayTitle = isRTL ? (titleAr || title) : title;

  if (products.length === 0) {
    return (
      <section
        id="products"
        className="py-16 lg:py-24"
        style={{ backgroundColor }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Search Bar even when empty */}
          {onSearchChange && (
            <div className="mb-8 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
                  className="w-full px-5 py-3 text-sm rounded-full outline-none transition-all duration-200"
                  style={{
                    backgroundColor: isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                    color: textColor,
                    border: `1px solid ${isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs"
                    style={{
                      [isRTL ? 'left' : 'right']: '14px',
                      color: textMuted,
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm tracking-[0.2em] uppercase" style={{ color: textMuted }}>
              {searchQuery
                ? (isRTL ? 'لا توجد نتائج' : 'No products found')
                : (isRTL ? 'لا توجد منتجات متاحة' : 'No products available')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Grid columns based on productsPerRow
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  }[productsPerRow] || 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4';

  return (
    <section
      id="products"
      className="py-16 lg:py-24"
      style={{ backgroundColor }}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        {displayTitle && (
          <div className="text-center mb-16">
            <p
              className="text-xs tracking-[0.4em] uppercase mb-4"
              style={{ color: accentColor }}
            >
              {isRTL ? 'تشكيلتنا' : 'Our Collection'}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light"
              style={{ color: textColor }}
            >
              {displayTitle}
            </h2>
            <div
              className="h-px mx-auto mt-8"
              style={{
                width: '60px',
                background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
              }}
            />
          </div>
        )}

        {/* Search Bar */}
        {onSearchChange && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
                className="w-full px-5 py-3 text-sm rounded-full outline-none transition-all duration-200"
                style={{
                  backgroundColor: isLightBg ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                  color: textColor,
                  border: `1px solid ${isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs"
                  style={{
                    [isRTL ? 'left' : 'right']: '14px',
                    color: textMuted,
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className={`grid ${gridCols} gap-8 lg:gap-12`}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              textColor={textColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
