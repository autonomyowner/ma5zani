'use client'

interface GuaranteeStripProps {
  text: string
  accentColor: string
  isDark?: boolean
}

export default function GuaranteeStrip({ text, accentColor, isDark }: GuaranteeStripProps) {
  return (
    <div
      className="py-4 px-6 rounded-xl flex items-center gap-3"
      style={{
        backgroundColor: isDark ? '#1a1a1a' : accentColor + '08',
        border: `1px solid ${isDark ? accentColor + '30' : accentColor + '20'}`,
      }}
    >
      {/* Checkmark */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accentColor + '15' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 5" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ opacity: 0.8 }}>
        {text}
      </p>
    </div>
  )
}
