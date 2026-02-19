'use client'

import { useEffect, useRef, useState } from 'react'

interface StickyOrderBarProps {
  price: number
  salePrice?: number
  ctaText: string
  accentColor: string
  onOrderClick: () => void
}

export default function StickyOrderBar({
  price,
  salePrice,
  ctaText,
  accentColor,
  onOrderClick,
}: StickyOrderBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const orderForm = document.getElementById('order-form')
    if (!orderForm) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when order form is NOT in viewport
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(orderForm)

    return () => observer.disconnect()
  }, [])

  const hasDiscount = salePrice && salePrice < price

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: accentColor }}>
                {salePrice!.toLocaleString()} DZD
              </span>
              <span className="text-sm text-slate-400 line-through">
                {price.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold" style={{ color: accentColor }}>
              {price.toLocaleString()} DZD
            </span>
          )}
        </div>
        <button
          onClick={onOrderClick}
          className="px-6 py-3 rounded-xl text-white font-bold text-sm whitespace-nowrap transition-transform active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          {ctaText}
        </button>
      </div>
    </div>
  )
}
