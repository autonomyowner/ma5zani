'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';

interface CartDrawerProps {
  slug: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    footerBg: string;
  };
  fonts: {
    display: string;
    body: string;
    arabic: string;
  };
}

import { isLightColor } from '@/lib/colors';

export default function CartDrawer({ slug, colors, fonts }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, closeCart } = useCart();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const isLightBg = isLightColor(colors.background);
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeCart]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: `${colors.background}cc` }}
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div
        className={`fixed top-0 h-full w-full max-w-md z-50 flex flex-col transform transition-transform duration-300 ease-out`}
        style={{
          backgroundColor: colors.background,
          ...(isRTL
            ? { left: 0, borderRight: `1px solid ${borderColor}`, transform: isCartOpen ? 'translateX(0)' : 'translateX(-100%)' }
            : { right: 0, borderLeft: `1px solid ${borderColor}`, transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)' }),
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-6"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <div>
            <h2
              className="text-lg tracking-[0.15em] uppercase"
              style={{
                fontFamily: `'${fonts.display}', serif`,
                color: colors.text,
              }}
            >
              {isRTL ? 'سلتك' : 'Your Cart'}
            </h2>
            <p className="text-xs mt-1" style={{ color: textMuted }}>
              {totalItems} {totalItems === 1 ? (isRTL ? 'منتج' : 'item') : (isRTL ? 'منتجات' : 'items')}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center transition-colors"
            style={{ color: textMuted }}
          >
            <span className="text-2xl font-light">&times;</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm tracking-wide mb-6" style={{ color: textMuted }}>
                {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
              </p>
              <button
                onClick={closeCart}
                className="px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: textMuted,
                }}
              >
                {isRTL ? 'تابع التسوق' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 pb-6"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  {/* Image */}
                  <div
                    className="w-24 h-32 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: cardBg }}
                  >
                    {item.imageKey ? (
                      <img
                        src={getR2PublicUrl(item.imageKey)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: textMuted }}
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <h3
                      className="text-sm tracking-[0.1em] uppercase"
                      style={{ color: colors.text }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: textMuted }}>
                      {(item.salePrice ?? item.price).toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                      {item.quantity > 1 && (
                        <span style={{ color: textMuted }}>
                          {' '}× {item.quantity} = {((item.salePrice ?? item.price) * item.quantity).toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                        </span>
                      )}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div
                        className="flex items-center"
                        style={{ border: `1px solid ${borderColor}` }}
                      >
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{ color: textMuted }}
                        >
                          -
                        </button>
                        <span
                          className="w-8 h-8 flex items-center justify-center text-sm"
                          style={{ color: colors.text }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                          style={{ color: textMuted }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs tracking-wider uppercase transition-colors hover:opacity-70"
                        style={{ color: textMuted }}
                      >
                        {isRTL ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-6 py-6 space-y-4"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.15em] uppercase" style={{ color: textMuted }}>
                {isRTL ? 'المجموع' : 'Total'}
              </span>
              <span
                className="text-lg font-medium"
                style={{ color: colors.text }}
              >
                {totalPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
              </span>
            </div>

            <p className="text-xs tracking-wide text-center" style={{ color: textMuted }}>
              {isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
            </p>

            {/* Checkout Button */}
            <Link
              href={`/${slug}/checkout`}
              onClick={closeCart}
              className="block w-full py-4 text-center text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.01]"
              style={{
                backgroundColor: colors.accent,
                color: isLightColor(colors.accent) ? '#0a0a0a' : '#ffffff',
              }}
            >
              {isRTL ? 'إتمام الطلب' : 'Proceed to Checkout'}
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="w-full py-3 text-center text-xs tracking-[0.15em] uppercase transition-colors"
              style={{ color: textMuted }}
            >
              {isRTL ? 'تابع التسوق' : 'Continue Shopping'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
