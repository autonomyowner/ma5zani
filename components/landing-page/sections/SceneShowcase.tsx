'use client'

import { useScrollReveal } from '../useScrollReveal'
import { getR2PublicUrl } from '@/lib/r2'

interface SceneShowcaseProps {
  sceneImageKey: string
  overlayText?: string
  primaryColor: string
  isDark?: boolean
}

export default function SceneShowcase({ sceneImageKey, overlayText, primaryColor, isDark }: SceneShowcaseProps) {
  const reveal = useScrollReveal()

  return (
    <section
      ref={reveal.ref}
      className={`relative overflow-hidden transition-all duration-700 ${
        reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
        <img
          src={getR2PublicUrl(sceneImageKey)}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 50%)'
              : `linear-gradient(to top, ${primaryColor}90 0%, transparent 50%)`,
          }}
        />
        {overlayText && (
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <p
              className="text-white text-xl sm:text-3xl font-bold max-w-4xl mx-auto text-center"
              style={{ fontFamily: 'var(--font-outfit)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {overlayText}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
