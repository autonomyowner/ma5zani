'use client'

import { useState, useRef } from 'react'
import { getR2PublicUrl } from '@/lib/r2'

interface ImageGalleryProps {
  images: string[] // R2 keys
  enhancedImages?: string[] // R2 keys for bg-removed images
  productName: string
  accentColor: string
}

export default function ImageGallery({
  images,
  enhancedImages,
  productName,
  accentColor,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const touchStartRef = useRef<number | null>(null)

  // Use enhanced image for first image if available, originals for rest
  const displayImages = images.map((key, i) => {
    if (i === 0 && enhancedImages?.[0]) {
      return getR2PublicUrl(enhancedImages[0])
    }
    return getR2PublicUrl(key)
  })

  if (displayImages.length === 0) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStartRef.current - touchEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
      } else {
        setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
      }
    }
    touchStartRef.current = null
  }

  return (
    <div>
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
        style={{ backgroundColor: '#f1f5f9' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={displayImages[selectedIndex]}
          alt={`${productName} ${selectedIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {displayImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all"
              style={{
                border: selectedIndex === i ? `2px solid ${accentColor}` : '2px solid transparent',
                opacity: selectedIndex === i ? 1 : 0.6,
              }}
            >
              <img
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
