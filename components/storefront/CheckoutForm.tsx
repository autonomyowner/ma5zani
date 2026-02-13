'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import { getR2PublicUrl } from '@/lib/r2';
import Image from 'next/image';
import WilayaSelect from './WilayaSelect';
import CommuneSelect from './CommuneSelect';

interface CheckoutFormProps {
  slug: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  metaPixelId?: string;
}

import { isLightColor } from '@/lib/colors';
import { trackEvent, sendServerEvent, generateEventId, META_EVENTS } from '@/lib/meta-pixel';

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
  const [deliveryType, setDeliveryType] = useState<'office' | 'home'>('office');
  const [commune, setCommune] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [feeAvailable, setFeeAvailable] = useState(true);

  const isLightBg = isLightColor(backgroundColor);
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const inputBg = isLightBg ? '#ffffff' : '#0a0a0a';
  const inputBorder = isLightBg ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';

  // Fetch delivery fee when wilaya or deliveryType changes
  useEffect(() => {
    if (!wilaya) {
      setDeliveryFee(null);
      return;
    }
    const fetchFee = async () => {
      setLoadingFee(true);
      setDeliveryFee(null);
      try {
        const res = await fetch(
          `/api/delivery/fees?slug=${encodeURIComponent(slug)}&toWilaya=${encodeURIComponent(wilaya)}&deliveryType=${deliveryType}`
        );
        const data = await res.json();
        if (data.available) {
          setDeliveryFee(data.fee);
          setFeeAvailable(true);
        } else {
          setDeliveryFee(null);
          setFeeAvailable(false);
        }
      } catch {
        setDeliveryFee(null);
        setFeeAvailable(false);
      }
      setLoadingFee(false);
    };
    fetchFee();
  }, [wilaya, deliveryType, slug]);

  // Track InitiateCheckout when checkout page loads
  useEffect(() => {
    if (items.length > 0) {
      const eventId = generateEventId();
      const eventData = {
        value: totalPrice,
        currency: 'DZD',
        content_ids: items.map((item) => item.productId),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      };
      trackEvent(META_EVENTS.INITIATE_CHECKOUT, eventData, eventId);
      sendServerEvent({
        eventName: META_EVENTS.INITIATE_CHECKOUT,
        eventId,
        sourceUrl: window.location.href,
        customData: eventData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaPixelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone || !wilaya || !deliveryAddress) {
      setError(localText(language, { ar: 'يرجى ملء جميع الحقول', en: 'Please fill all fields', fr: 'Veuillez remplir tous les champs' }));
      return;
    }

    // Algerian phone validation: must start with 05, 06, or 07 and be 10 digits
    const phoneDigits = customerPhone.replace(/\s+/g, '');
    if (!/^0[567]\d{8}$/.test(phoneDigits)) {
      setError(localText(language, { ar: 'رقم الهاتف غير صالح (يجب أن يبدأ بـ 05/06/07 ويتكون من 10 أرقام)', en: 'Invalid phone number (must start with 05/06/07 and be 10 digits)', fr: 'Numero de telephone invalide (doit commencer par 05/06/07 et contenir 10 chiffres)' }));
      return;
    }

    if (items.length === 0) {
      setError(localText(language, { ar: 'سلتك فارغة', en: 'Your cart is empty', fr: 'Votre panier est vide' }));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        storefrontSlug: slug,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        customerName,
        customerPhone,
        wilaya,
        commune: commune || undefined,
        deliveryType,
        deliveryAddress,
        deliveryFee: deliveryFee ?? undefined,
      });

      // Track Purchase with dedup
      const purchaseEventId = generateEventId();
      const purchaseData = {
        value: totalPrice,
        currency: 'DZD',
        content_ids: items.map((item) => item.productId),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      };
      trackEvent(META_EVENTS.PURCHASE, purchaseData, purchaseEventId);
      sendServerEvent({
        eventName: META_EVENTS.PURCHASE,
        eventId: purchaseEventId,
        sourceUrl: window.location.href,
        userData: {
          phone: customerPhone,
          firstName: customerName.split(' ')[0],
          lastName: customerName.split(' ').slice(1).join(' ') || undefined,
        },
        customData: purchaseData,
      });

      clearCart();
      router.push(`/${slug}/order-success/${result.orderIds[0]}`);
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : localText(language, { ar: 'فشل إرسال الطلب', en: 'Failed to place order', fr: 'Echec de la commande' }));
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
            {localText(language, { ar: 'سلتك فارغة', en: 'Your cart is empty', fr: 'Votre panier est vide' })}
          </p>
          <a
            href={`/${slug}`}
            className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: accentColor,
              color: isLightColor(accentColor) ? '#0a0a0a' : '#ffffff',
            }}
          >
            {localText(language, { ar: 'تابع التسوق', en: 'Continue Shopping', fr: 'Continuer les achats' })}
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
            {localText(language, { ar: 'إتمام الطلب', en: 'Checkout', fr: 'Commande' })}
          </p>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-light"
            style={{
              color: textColor,
              fontFamily: 'var(--font-display, serif)',
            }}
          >
            {localText(language, { ar: 'تفاصيل الطلب', en: 'Order Details', fr: 'Details de la commande' })}
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
              {localText(language, { ar: 'ملخص الطلب', en: 'Order Summary', fr: 'Resume de la commande' })}
            </h2>

            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 pb-6"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  <div
                    className="relative w-20 h-24 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: inputBg }}
                  >
                    {item.imageKey ? (
                      <Image
                        src={getR2PublicUrl(item.imageKey)}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
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
                    {(item.selectedSize || item.selectedColor) && (
                      <p className="text-xs mb-1" style={{ color: textMuted }}>
                        {[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="text-xs mb-2" style={{ color: textMuted }}>
                      {localText(language, { ar: `الكمية: ${item.quantity}`, en: `Qty: ${item.quantity}`, fr: `Qte: ${item.quantity}` })}
                    </p>
                    <p className="text-sm font-medium" style={{ color: accentColor }}>
                      {((item.salePrice ?? item.price) * item.quantity).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs tracking-[0.15em] uppercase"
                style={{ color: textMuted }}
              >
                {localText(language, { ar: 'المجموع الفرعي', en: 'Subtotal', fr: 'Sous-total' })}
              </span>
              <span
                className="text-lg font-light"
                style={{ color: textColor }}
              >
                {totalPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
              </span>
            </div>

            {/* Delivery Fee */}
            {wilaya && (
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: textMuted }}
                >
                  {localText(language, { ar: 'رسوم التوصيل', en: 'Delivery Fee', fr: 'Frais de livraison' })}
                </span>
                <span className="text-lg font-light" style={{ color: textColor }}>
                  {loadingFee
                    ? '...'
                    : deliveryFee !== null
                    ? `${deliveryFee.toLocaleString()} ${localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}`
                    : '-'}
                </span>
              </div>
            )}

            {/* Total */}
            <div
              className="flex items-center justify-between mb-4 pt-3"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              <span
                className="text-xs tracking-[0.15em] uppercase"
                style={{ color: textMuted }}
              >
                {localText(language, { ar: 'المجموع الكلي', en: 'Total', fr: 'Total' })}
              </span>
              <span
                className="text-2xl font-light"
                style={{ color: textColor }}
              >
                {(totalPrice + (deliveryFee || 0)).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
              </span>
            </div>

            <p className="text-xs tracking-wide text-center" style={{ color: textMuted }}>
              {localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' })}
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
              {localText(language, { ar: 'معلومات التوصيل', en: 'Delivery Information', fr: 'Informations de livraison' })}
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
                  {localText(language, { ar: 'الاسم الكامل *', en: 'Full Name *', fr: 'Nom complet *' })}
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
                  placeholder={localText(language, { ar: 'اسمك الكامل', en: 'Your full name', fr: 'Votre nom complet' })}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {localText(language, { ar: 'رقم الهاتف *', en: 'Phone Number *', fr: 'Numero de telephone *' })}
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
                  {localText(language, { ar: 'الولاية *', en: 'Wilaya *', fr: 'Wilaya *' })}
                </label>
                <WilayaSelect
                  value={wilaya}
                  onChange={(v) => { setWilaya(v); setCommune(''); }}
                  backgroundColor={inputBg}
                  borderColor={inputBorder}
                  textColor={textColor}
                />
              </div>

              {/* Delivery Type */}
              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {localText(language, { ar: 'نوع التوصيل *', en: 'Delivery Type *', fr: 'Type de livraison *' })}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setDeliveryType('office'); setCommune(''); }}
                    className="flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-all duration-300"
                    style={{
                      backgroundColor: deliveryType === 'office' ? accentColor : inputBg,
                      color: deliveryType === 'office' ? (isLightColor(accentColor) ? '#0a0a0a' : '#ffffff') : textColor,
                      border: `1px solid ${deliveryType === 'office' ? accentColor : inputBorder}`,
                    }}
                  >
                    {localText(language, { ar: 'مكتب (ستوب ديسك)', en: 'Office (Stop Desk)', fr: 'Bureau (Stop Desk)' })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className="flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-all duration-300"
                    style={{
                      backgroundColor: deliveryType === 'home' ? accentColor : inputBg,
                      color: deliveryType === 'home' ? (isLightColor(accentColor) ? '#0a0a0a' : '#ffffff') : textColor,
                      border: `1px solid ${deliveryType === 'home' ? accentColor : inputBorder}`,
                    }}
                  >
                    {localText(language, { ar: 'المنزل', en: 'Home', fr: 'Domicile' })}
                  </button>
                </div>
              </div>

              {/* Commune */}
              {wilaya && (
                <div>
                  <label
                    className="block text-xs tracking-[0.15em] uppercase mb-3"
                    style={{ color: textMuted }}
                  >
                    {localText(language, { ar: 'البلدية', en: 'Commune', fr: 'Commune' })}
                  </label>
                  <CommuneSelect
                    wilayaName={wilaya}
                    value={commune}
                    onChange={setCommune}
                    backgroundColor={inputBg}
                    borderColor={inputBorder}
                    textColor={textColor}
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-3"
                  style={{ color: textMuted }}
                >
                  {localText(language, { ar: 'عنوان التوصيل *', en: 'Delivery Address *', fr: 'Adresse de livraison *' })}
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
                  placeholder={localText(language, { ar: 'الشارع، المبنى، الشقة...', en: 'Street, building, apartment...', fr: 'Rue, batiment, appartement...' })}
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
                  ? localText(language, { ar: '⏳ جاري الإرسال...', en: '⏳ Placing Order...', fr: '⏳ Commande en cours...' })
                  : localText(language, { ar: 'تأكيد الطلب', en: 'Place Order', fr: 'Confirmer la commande' })}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
