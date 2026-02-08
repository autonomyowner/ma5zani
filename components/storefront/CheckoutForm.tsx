'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getR2PublicUrl } from '@/lib/r2';
import WilayaSelect from './WilayaSelect';

interface CheckoutFormProps {
  slug: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  metaPixelId?: string;
}

import { isLightColor } from '@/lib/colors';

// Helper to track Meta Pixel events
const trackPixelEvent = (eventName: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) {
    (window as unknown as { fbq: (action: string, event: string, data?: Record<string, unknown>) => void }).fbq(
      'track',
      eventName,
      data
    );
  }
};

export default function CheckoutForm({
  slug,
  accentColor,
  backgroundColor = '#0a0a0a',
  textColor = '#f5f5dc',
  metaPixelId
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const createOrder = useMutation(api.publicOrders.createPublicOrder);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isLightBg = isLightColor(backgroundColor);
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const inputBg = isLightBg ? '#ffffff' : '#0a0a0a';
  const inputBorder = isLightBg ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';

  // Track InitiateCheckout when checkout page loads
  useEffect(() => {
    if (metaPixelId && items.length > 0) {
      trackPixelEvent('InitiateCheckout', {
        value: totalPrice,
        currency: 'DZD',
        content_ids: items.map((item) => item.productId),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaPixelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone || !wilaya || !deliveryAddress) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    // Algerian phone validation: must start with 05, 06, or 07 and be 10 digits
    const phoneDigits = customerPhone.replace(/\s+/g, '');
    if (!/^0[567]\d{8}$/.test(phoneDigits)) {
      setError(isRTL ? 'رقم الهاتف غير صالح (يجب أن يبدأ بـ 05/06/07 ويتكون من 10 أرقام)' : 'Invalid phone number (must start with 05/06/07 and be 10 digits)');
      return;
    }

    if (items.length === 0) {
      setError(isRTL ? 'سلتك فارغة' : 'Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        storefrontSlug: slug,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerName,
        customerPhone,
        wilaya,
        deliveryAddress,
      });

      if (metaPixelId) {
        trackPixelEvent('Purchase', {
          value: totalPrice,
          currency: 'DZD',
          content_ids: items.map((item) => item.productId),
          content_type: 'product',
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        });
      }

      clearCart();
      router.push(`/${slug}/order-success/${result.orderIds[0]}`);
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل إرسال الطلب' : 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section
        className="min-h-[60vh] flex items-center justify-center py-24"
        style={{ backgroundColor }}
      >
        <div className="text-center px-6">
          <p
            className="text-sm tracking-[0.2em] uppercase mb-8"
            style={{ color: textMuted }}
          >
            {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
          </p>
          <a
            href={`/${slug}`}
            className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: accentColor,
              color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
            }}
          >
            {isRTL ? 'تابع التسوق' : 'Continue Shopping'}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-24 lg:py-32"
      style={{ backgroundColor }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{ color: accentColor }}
          >
            {isRTL ? 'إتمام الطلب' : 'Checkout'}
          </p>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-light"
            style={{
              color: textColor,
              fontFamily: 'var(--font-display, serif)',
            }}
          >
            {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
          </h1>
          <div
            className="h-px mx-auto mt-8"
            style={{
              width: '60px',
              background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Order Summary */}
          <div
            className="p-8 lg:p-10"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h2
              className="text-xs tracking-[0.3em] uppercase mb-8"
              style={{ color: textMuted }}
            >
              {isRTL ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 pb-6"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  <div
                    className="w-20 h-24 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: inputBg }}
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
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-sm tracking-[0.1em] uppercase mb-1"
                      style={{ color: textColor }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: textMuted }}>
                      {isRTL ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                    </p>
                    <p className="text-sm font-medium" style={{ color: accentColor }}>
                      {((item.salePrice ?? item.price) * item.quantity).toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs tracking-[0.15em] uppercase"
                style={{ color: textMuted }}
              >
                {isRTL ? 'المجموع' : 'Total'}
              </span>
              <span
                className="text-2xl font-light"
                style={{ color: textColor }}
              >
                {totalPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
              </span>
            </div>

            <p className="text-xs tracking-wide text-center" style={{ color: textMuted }}>
              {isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
            </p>
          </div>

          {/* Customer Info Form */}
          <div
            className="p-8 lg:p-10"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h2
              className="text-xs tracking-[0.3em] uppercase mb-8"
              style={{ color: textMuted }}
            >
              {isRTL ? 'معلومات التوصيل' : 'Delivery Information'}
            </h2>

            {error && (
              <div
                className="mb-6 p-4 text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textColor,
                  }}
                  placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${error && !/^0[567]\d{8}$/.test(customerPhone.replace(/\s+/g, '')) && customerPhone ? '#ef4444' : inputBorder}`,
                    color: textColor,
                  }}
                  placeholder="05XX XXX XXX"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {isRTL ? 'الولاية *' : 'Wilaya *'}
                </label>
                <WilayaSelect
                  value={wilaya}
                  onChange={setWilaya}
                  backgroundColor={inputBg}
                  borderColor={inputBorder}
                  textColor={textColor}
                />
              </div>

              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {isRTL ? 'عنوان التوصيل *' : 'Delivery Address *'}
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-3 text-sm transition-colors focus:outline-none resize-none"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textColor,
                  }}
                  placeholder={isRTL ? 'الشارع، المبنى، الشقة...' : 'Street, building, apartment...'}
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                style={{
                  backgroundColor: accentColor,
                  color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
                }}
              >
                {submitting
                  ? (isRTL ? '⏳ جاري الإرسال...' : '⏳ Placing Order...')
                  : (isRTL ? 'تأكيد الطلب' : 'Place Order')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
