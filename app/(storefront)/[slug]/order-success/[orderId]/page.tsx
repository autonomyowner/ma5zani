'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';

export default function OrderSuccessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const orderId = params.orderId as string;

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });
  const order = useQuery(api.publicOrders.getPublicOrder, {
    orderId: orderId as Id<'orders'>,
  });

  // Loading state
  if (storefront === undefined || order === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // Not found state
  if (!storefront) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h1>
          <p className="text-slate-500">This store doesn&apos;t exist or is not published.</p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontLayout storefront={storefront}>
      <div className="max-w-lg mx-auto text-center py-12">
        {/* Success Icon */}
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${storefront.theme.accentColor}20` }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: storefront.theme.accentColor }}
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
          className="text-2xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          Order Placed Successfully!
        </h1>
        <p className="text-slate-500 mb-8">
          Thank you for your order. We&apos;ll contact you soon to confirm delivery.
        </p>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-left">
            <h2 className="font-semibold text-slate-900 mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number</span>
                <span className="font-medium text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-slate-900">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity</span>
                <span className="font-medium text-slate-900">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span
                  className="font-bold"
                  style={{ color: storefront.theme.accentColor }}
                >
                  {order.amount.toLocaleString()} DZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery to</span>
                <span className="font-medium text-slate-900">{order.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="font-medium text-slate-900">Cash on Delivery</span>
              </div>
            </div>
          </div>
        )}

        {/* Continue Shopping Button */}
        <Link
          href={`/${slug}`}
          className="inline-block px-8 py-3 text-white font-semibold rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: storefront.theme.accentColor }}
        >
          Continue Shopping
        </Link>
      </div>
    </StorefrontLayout>
  );
}
