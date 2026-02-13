'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
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
          {localText(language, { ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...' })}
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
            {localText(language, { ar: 'المتجر غير موجود', en: 'Store Not Found', fr: 'Boutique introuvable' })}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            {localText(language, { ar: 'هذا المتجر غير موجود أو غير منشور.', en: "This store doesn't exist or is not published.", fr: 'Cette boutique n\'existe pas ou n\'est pas publiee.' })}
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
  const currency = localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' });

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
          {localText(language, { ar: 'تم تقديم الطلب بنجاح!', en: 'Order Placed Successfully!', fr: 'Commande passee avec succes !' })}
        </h1>
        <p className="mb-8" style={{ color: textMuted }}>
          {localText(language, { ar: 'شكراً لطلبك. سنتواصل معك قريباً لتأكيد التوصيل.', en: "Thank you for your order. We'll contact you soon to confirm delivery.", fr: 'Merci pour votre commande. Nous vous contacterons bientot pour confirmer la livraison.' })}
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
              {localText(language, { ar: 'تفاصيل الطلب', en: 'Order Details', fr: 'Details de la commande' })}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'رقم الطلب', en: 'Order Number', fr: 'Numero de commande' })}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'المنتج', en: 'Product', fr: 'Produit' })}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'الكمية', en: 'Quantity', fr: 'Quantite' })}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.quantity}</span>
              </div>
              {order.deliveryFee != null && order.deliveryFee > 0 && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: textMuted }}>{localText(language, { ar: 'المجموع الفرعي', en: 'Subtotal', fr: 'Sous-total' })}</span>
                    <span className="font-medium" style={{ color: textColor }}>
                      {order.amount.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: textMuted }}>{localText(language, { ar: 'رسوم التوصيل', en: 'Delivery Fee', fr: 'Frais de livraison' })}</span>
                    <span className="font-medium" style={{ color: textColor }}>
                      {order.deliveryFee.toLocaleString()} {currency}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'المجموع الكلي', en: 'Total', fr: 'Total' })}</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {(order.amount + (order.deliveryFee || 0)).toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'التوصيل إلى', en: 'Delivery to', fr: 'Livraison a' })}</span>
                <span className="font-medium" style={{ color: textColor }}>{order.wilaya}</span>
              </div>
              {order.commune && (
                <div className="flex justify-between">
                  <span style={{ color: textMuted }}>{localText(language, { ar: 'البلدية', en: 'Commune', fr: 'Commune' })}</span>
                  <span className="font-medium" style={{ color: textColor }}>{order.commune}</span>
                </div>
              )}
              {order.deliveryType && (
                <div className="flex justify-between">
                  <span style={{ color: textMuted }}>{localText(language, { ar: 'نوع التوصيل', en: 'Delivery Type', fr: 'Type de livraison' })}</span>
                  <span className="font-medium" style={{ color: textColor }}>
                    {order.deliveryType === 'home'
                      ? localText(language, { ar: 'المنزل', en: 'Home', fr: 'Domicile' })
                      : localText(language, { ar: 'مكتب (ستوب ديسك)', en: 'Office (Stop Desk)', fr: 'Bureau (Stop Desk)' })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: textMuted }}>{localText(language, { ar: 'الدفع', en: 'Payment', fr: 'Paiement' })}</span>
                <span className="font-medium" style={{ color: textColor }}>
                  {localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' })}
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
          {localText(language, { ar: 'تابع التسوق', en: 'Continue Shopping', fr: 'Continuer les achats' })}
        </Link>
      </div>
    </StorefrontLayout>
  );
}
