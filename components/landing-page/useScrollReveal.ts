import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight IntersectionObserver hook for scroll-reveal animations.
 * Once visible, stays visible (no re-hide on scroll up).
 */
export function useScrollReveal(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element) // Once visible, stop observing
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '-50px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options?.threshold, options?.rootMargin])

  return { ref, isVisible }
}
