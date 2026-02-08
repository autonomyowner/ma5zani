'use client'

import { useEffect } from 'react'

export function MetaPixel() {
  useEffect(() => {
    try {
      if ((window as any).fbq) return

      ;(function(f: any, b: any, e: any, v: any) {
        var n: any, t: any, s: any
        if (f.fbq) return
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        }
        if (!f._fbq) f._fbq = n
        n.push = n
        n.loaded = !0
        n.version = '2.0'
        n.queue = []
        t = b.createElement(e)
        t.async = !0
        t.src = v
        t.onerror = function() {}
        s = b.getElementsByTagName(e)[0]
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s)
        } else {
          b.head.appendChild(t)
        }
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

      ;(window as any).fbq('init', '1343395010814971')
      ;(window as any).fbq('track', 'PageView')
    } catch {
      // Silent fail
    }
  }, [])

  return null
}
