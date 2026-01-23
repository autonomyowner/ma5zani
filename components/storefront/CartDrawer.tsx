'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';

interface CartDrawerProps {
  slug: string;
  accentColor: string;
}

export default function CartDrawer({ slug, accentColor }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  // Listen for cart toggle button clicks
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const button = document.getElementById('cart-toggle');
    button?.addEventListener('click', handleToggle);
    return () => button?.removeEventListener('click', handleToggle);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Shopping Cart ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  {/* Image */}
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm truncate">{item.name}</h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: accentColor }}>
                      {(item.salePrice ?? item.price).toLocaleString()} DZD
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600">Total</span>
              <span className="text-xl font-bold" style={{ color: accentColor }}>
                {totalPrice.toLocaleString()} DZD
              </span>
            </div>
            <Link
              href={`/${slug}/checkout`}
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 text-center text-white font-semibold rounded-xl transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
