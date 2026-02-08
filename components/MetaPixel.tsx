'use client'

import { useEffect } from 'react'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1343395010814971'

export function MetaPixel() {
  useEffect(() => {
    try {
      const w = window as unknown as Record<string, unknown>
      if (w.fbq) return

      const fbq = function (...args: unknown[]) {
        if ((fbq as unknown as { callMethod?: (...a: unknown[]) => void }).callMethod) {
          (fbq as unknown as { callMethod: (...a: unknown[]) => void }).callMethod(...args)
        } else {
          (fbq as unknown as { queue: unknown[] }).queue.push(args)
        }
      } as unknown as Record<string, unknown>

      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = [] as unknown[]

      w.fbq = fbq
      if (!w._fbq) w._fbq = fbq

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      script.onerror = () => {} // Silent fail if blocked
      document.head.appendChild(script)

      ;(w.fbq as (...args: unknown[]) => void)('init', META_PIXEL_ID)
      ;(w.fbq as (...args: unknown[]) => void)('track', 'PageView')
    } catch {
      // Silent fail - don't break the app for tracking
    }
  }, [])

  return null
}
