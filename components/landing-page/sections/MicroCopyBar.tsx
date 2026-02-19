'use client'

interface MicroCopyBarProps {
  microCopy: { delivery: string; payment: string; returns: string }
  accentColor: string
  isDark?: boolean
}

export default function MicroCopyBar({ microCopy, accentColor, isDark }: MicroCopyBarProps) {
  const items = [microCopy.delivery, microCopy.payment, microCopy.returns]

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {items.map((text, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isDark ? '#ffffff08' : accentColor + '08',
            color: isDark ? '#e0e0e0' : undefined,
            opacity: isDark ? 1 : 0.7,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          {text}
        </div>
      ))}
    </div>
  )
}
