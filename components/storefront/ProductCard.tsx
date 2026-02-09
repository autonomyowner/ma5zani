'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Doc } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';

interface ProductCardProps {
  product: Doc<'products'>;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
}

import { isLightColor } from '@/lib/colors';

export default function ProductCard({
  product,
  accentColor,
  backgroundColor = '#0a0a0a',
  textColor = '#f5f5dc',
}: ProductCardProps) {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, getItemQuantity } = useCart();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  const quantity = getItemQuantity(product._id);
  const images = product.imageKeys && product.imageKeys.length > 0 ? product.imageKeys : [];
  const imageUrl = images.length > 0 ? getR2PublicUrl(images[0]) : null;

  const isOnSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice ?? product.price;
  const isOutOfStock = product.status === 'out_of_stock';

  const isLightBg = isLightColor(backgroundColor);
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      imageKey: product.imageKeys?.[0],
      stock: product.stock,
    });
  };

  return (
    <Link href={`/${slug}/product/${product._id}`}>
      <article
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-5"
          style={{ backgroundColor: cardBg }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
              loading="lazy"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ color: textMuted }}
            >
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-opacity duration-300"
            style={{
              backgroundColor: `${backgroundColor}99`,
              opacity: isHovered && !isOutOfStock ? 1 : 0,
              pointerEvents: isHovered && !isOutOfStock ? 'auto' : 'none',
            }}
          >
            {/* Quick Add Button */}
            <button
              onClick={handleAddToCart}
              className="w-full max-w-[200px] py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: accentColor,
                color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
              }}
            >
              {quantity > 0
                ? localText(language, { ar: `في السلة (${quantity})`, en: `In Cart (${quantity})`, fr: `Dans le panier (${quantity})` })
                : localText(language, { ar: 'أضف للسلة', en: 'Add to Cart', fr: 'Ajouter au panier' })}
            </button>
          </div>

          {/* Sale Badge */}
          {isOnSale && !isOutOfStock && (
            <div
              className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium"
              style={{
                backgroundColor: accentColor,
                color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
              }}
            >
              {localText(language, { ar: 'تخفيض', en: 'Sale', fr: 'Promo' })}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <span
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase font-medium"
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                }}
              >
                {localText(language, { ar: 'نفذ المخزون', en: 'Sold Out', fr: 'Epuise' })}
              </span>
            </div>
          )}

          {/* Mobile Quick Add Button - always visible on touch devices */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 active:scale-90 touch-add-btn"
            style={{
              backgroundColor: accentColor,
              color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
              opacity: isOutOfStock ? 0 : 1,
              pointerEvents: isOutOfStock ? 'none' : 'auto',
            }}
          >
            {quantity > 0 ? quantity : '+'}
          </button>

          {/* Multiple Images Indicator */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-4 flex gap-2"
              style={{ opacity: isHovered ? 0 : 1, transition: 'opacity 0.3s' }}
            >
              {images.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: i === 0 ? accentColor : textMuted,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3
            className="text-sm tracking-[0.1em] uppercase transition-colors duration-300"
            style={{
              color: isHovered ? accentColor : textColor,
            }}
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-medium"
              style={{ color: textColor }}
            >
              {displayPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
            </span>
            {isOnSale && (
              <span
                className="text-xs line-through"
                style={{ color: textMuted }}
              >
                {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Decorative line on hover */}
        <div
          className="absolute -bottom-2 left-0 h-px transition-all duration-500 ease-out"
          style={{
            width: isHovered ? '100%' : '0%',
            backgroundColor: accentColor,
          }}
        />
      </article>
    </Link>
  );
}
