'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';
import WilayaSelect from './WilayaSelect';

interface CheckoutFormProps {
  slug: string;
  accentColor: string;
  metaPixelId?: string;
}

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

export default function CheckoutForm({ slug, accentColor, metaPixelId }: CheckoutFormProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useMutation(api.publicOrders.createPublicOrder);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  }, [metaPixelId]); // Only run once when checkout page loads

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone || !wilaya || !deliveryAddress) {
      setError('Please fill all fields');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
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

      // Track Meta Pixel Purchase event
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
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-slate-500 mb-4">Your cart is empty</p>
        <a
          href={`/${slug}`}
          className="inline-block px-6 py-3 text-white rounded-xl font-medium"
          style={{ backgroundColor: accentColor }}
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageKey ? (
                    <img
                      src={getR2PublicUrl(item.imageKey)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 text-sm">{item.name}</h3>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-semibold" style={{ color: accentColor }}>
                  {((item.salePrice ?? item.price) * item.quantity).toLocaleString()} DZD
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold" style={{ color: accentColor }}>
                {totalPrice.toLocaleString()} DZD
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Cash on delivery (COD)</p>
          </div>
        </div>

        {/* Customer Info Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Delivery Information</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                placeholder="05XX XXX XXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Wilaya *
              </label>
              <WilayaSelect value={wilaya} onChange={setWilaya} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                placeholder="Street address, building, apartment..."
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-white font-semibold rounded-xl transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
