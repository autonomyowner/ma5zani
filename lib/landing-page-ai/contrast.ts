// WCAG Color Contrast Validation Utilities
// Pure functions, no external dependencies

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  if (cleaned.length !== 6) return null
  const num = parseInt(cleaned, 16)
  if (isNaN(num)) return null
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  if (!c1 || !c2) return 1

  const l1 = relativeLuminance(c1.r, c1.g, c1.b)
  const l2 = relativeLuminance(c2.r, c2.g, c2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

interface DesignPalette {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

/**
 * Validates a palette against WCAG AA standards:
 * - Text on background: 4.5:1 minimum
 * - Accent (large text/buttons) on background: 3:1 minimum
 */
export function validatePalette(design: DesignPalette): {
  textPasses: boolean
  accentPasses: boolean
  primaryPasses: boolean
  textRatio: number
  accentRatio: number
  primaryRatio: number
} {
  const textRatio = contrastRatio(design.textColor, design.backgroundColor)
  const accentRatio = contrastRatio(design.accentColor, design.backgroundColor)
  const primaryRatio = contrastRatio(design.primaryColor, design.backgroundColor)

  return {
    textPasses: textRatio >= 4.5,
    accentPasses: accentRatio >= 3,
    primaryPasses: primaryRatio >= 3,
    textRatio,
    accentRatio,
    primaryRatio,
  }
}

function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)))
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)))
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Auto-fixes palette to meet WCAG AA contrast requirements.
 * Darkens colors that fail against light backgrounds.
 */
export function adjustForContrast(design: DesignPalette): DesignPalette {
  const result = { ...design }
  const validation = validatePalette(result)

  // Fix text contrast (need 4.5:1)
  if (!validation.textPasses) {
    let attempts = 0
    while (contrastRatio(result.textColor, result.backgroundColor) < 4.5 && attempts < 10) {
      result.textColor = darkenHex(result.textColor, 0.15)
      attempts++
    }
  }

  // Fix accent contrast (need 3:1 for buttons/large text)
  if (!validation.accentPasses) {
    let attempts = 0
    while (contrastRatio(result.accentColor, result.backgroundColor) < 3 && attempts < 10) {
      result.accentColor = darkenHex(result.accentColor, 0.12)
      attempts++
    }
  }

  // Fix primary contrast (need 3:1 for headings)
  if (!validation.primaryPasses) {
    let attempts = 0
    while (contrastRatio(result.primaryColor, result.backgroundColor) < 3 && attempts < 10) {
      result.primaryColor = darkenHex(result.primaryColor, 0.12)
      attempts++
    }
  }

  return result
}

/**
 * Auto-fixes palette for dark themes to meet WCAG AA contrast requirements.
 * Lightens text/accent colors that fail against dark backgrounds.
 */
export function adjustForDarkTheme(design: DesignPalette): DesignPalette {
  const result = { ...design }

  // Fix text contrast (need 4.5:1) — lighten text on dark bg
  let attempts = 0
  while (contrastRatio(result.textColor, result.backgroundColor) < 4.5 && attempts < 10) {
    result.textColor = lightenHex(result.textColor, 0.15)
    attempts++
  }

  // Fix accent contrast (need 3:1 for buttons/large text) — lighten accent on dark bg
  attempts = 0
  while (contrastRatio(result.accentColor, result.backgroundColor) < 3 && attempts < 10) {
    result.accentColor = lightenHex(result.accentColor, 0.12)
    attempts++
  }

  // Fix primary contrast (need 3:1 for headings) — lighten primary on dark bg
  attempts = 0
  while (contrastRatio(result.primaryColor, result.backgroundColor) < 3 && attempts < 10) {
    result.primaryColor = lightenHex(result.primaryColor, 0.12)
    attempts++
  }

  return result
}

/**
 * Generates gradient pair from a primary color.
 * gradientFrom = primary, gradientTo = 20% lighter version.
 */
export function generateGradient(primaryColor: string): {
  gradientFrom: string
  gradientTo: string
} {
  return {
    gradientFrom: primaryColor,
    gradientTo: lightenHex(primaryColor, 0.35),
  }
}
