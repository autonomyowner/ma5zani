'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { isLightColor } from '@/lib/colors';

export default function OrderSuccessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const orderId = params.orderId as string;
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });
  const order = useQuery(api.publicOrders.getPublicOrder, {
    orderId: orderId as Id<'orders'>,
  });

  // Loading state
  if (storefront === undefined || order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="animate-pulse" style={{ color: '#f5f5dc' }}>
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // Not found state
  if (!storefront) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f5f5dc' }}>
            {isRTL ? 'المتجر غير موجود' : 'Store Not Found'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isRTL ? 'هذا المتجر غير موجود أو غير منشور.' : "This store doesn't exist or is not published."}
          </p>
        </div>
      </div>
    );
  }

  const accentColor = storefront.colors?.accent || storefront.theme.accentColor || '#c9a962';
  const backgroundColor = storefront.colors?.background || '#0a0a0a';
  const textColor = storefront.colors?.text || '#f5f5dc';
  const isLightBg = isLightColor(backgroundColor);
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const currency = isRTL ? 'دج' : 'DZD';

  return (
    <StorefrontLayout storefront={storefront}>
      <div className="max-w-lg mx-auto text-center py-12">
        {/* Success checkmark */}
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: accentColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: textColor, fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          {isRTL ? 'تم تقديم الطلب بنجاح!' : 'Order Placed Successfully!'}
        </h1>
        <p className="mb-8" style={{ color: textMuted }}>
          {isRTL
            ? 'شكراً لطلبك. سنتواصل معك قريباً لتأكيد التوصيل.'
            : "Thank you for your order. We'll contact you soon to confirm delivery."}
        </p>

        {/* Order Details */}
        {order && (
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <h2 className="font-semibold mb-4" style={{ color: textColor }}>
              {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'رقم الطلب' : 'Order Number'}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'المنتج' : 'Product'}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'الكمية' : 'Quantity'}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'المجموع' : 'Total'}</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {order.amount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'التوصيل إلى' : 'Delivery to'}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{isRTL ? 'الدفع' : 'Payment'}</span>
                <span className="font-medium" style={{ color: textColor }}>
                  {isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Continue Shopping Button */}
        <Link
          href={`/${slug}`}
          className="inline-block px-8 py-3 font-semibold rounded-xl transition-colors hover:opacity-90"
          style={{
            backgroundColor: accentColor,
            color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
          }}
        >
          {isRTL ? 'تابع التسوق' : 'Continue Shopping'}
        </Link>
      </div>
    </StorefrontLayout>
  );
}
