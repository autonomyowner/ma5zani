// AI Storefront Builder - Configuration Validator
// Validates and sanitizes AI-generated configurations

import { GeneratedConfig } from './context-builder';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  config?: GeneratedConfig;
}

const VALID_SECTION_TYPES = [
  'hero',
  'announcement',
  'featured',
  'features',
  'categories',
  'grid',
  'collection',
  'newsletter',
  'about',
];

const VALID_FONTS = {
  display: [
    'Playfair Display',
    'Cormorant',
    'Cormorant Garamond',
    'Bebas Neue',
    'Oswald',
    'Abril Fatface',
    'Cinzel',
    'Lora',
    'Merriweather',
    'Libre Baskerville',
  ],
  body: [
    'Source Serif Pro',
    'Lora',
    'Merriweather',
    'Libre Baskerville',
    'Crimson Text',
    'Cormorant',
    'Cormorant Garamond',
  ],
  arabic: [
    'Tajawal',
    'Cairo',
    'Almarai',
    'Amiri',
    'Changa',
    'El Messiri',
    'Noto Sans Arabic',
  ],
};

export function validateConfig(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Invalid input: expected object'] };
  }

  const config = input as Record<string, unknown>;

  // Validate aestheticDirection
  if (
    !config.aestheticDirection ||
    typeof config.aestheticDirection !== 'string'
  ) {
    errors.push('Missing or invalid aestheticDirection');
  }

  // Validate fonts
  if (!config.fonts || typeof config.fonts !== 'object') {
    errors.push('Missing or invalid fonts object');
  } else {
    const fonts = config.fonts as Record<string, unknown>;
    if (!fonts.display || typeof fonts.display !== 'string') {
      errors.push('Missing or invalid fonts.display');
    }
    if (!fonts.body || typeof fonts.body !== 'string') {
      errors.push('Missing or invalid fonts.body');
    }
    if (!fonts.arabic || typeof fonts.arabic !== 'string') {
      errors.push('Missing or invalid fonts.arabic');
    }
  }

  // Validate colors
  if (!config.colors || typeof config.colors !== 'object') {
    errors.push('Missing or invalid colors object');
  } else {
    const colors = config.colors as Record<string, unknown>;
    const requiredColors = [
      'primary',
      'accent',
      'background',
      'text',
      'headerBg',
      'footerBg',
    ];
    for (const color of requiredColors) {
      if (!colors[color] || typeof colors[color] !== 'string') {
        errors.push(`Missing or invalid colors.${color}`);
      } else if (!isValidHexColor(colors[color] as string)) {
        errors.push(`Invalid hex color for colors.${color}: ${colors[color]}`);
      }
    }
  }

  // Validate sections
  if (!config.sections || !Array.isArray(config.sections)) {
    errors.push('Missing or invalid sections array');
  } else {
    const sectionIds = new Set<string>();
    for (let i = 0; i < config.sections.length; i++) {
      const section = config.sections[i] as Record<string, unknown>;
      const sectionErrors = validateSection(section, i, sectionIds);
      errors.push(...sectionErrors);
      if (section.id) {
        sectionIds.add(section.id as string);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize and return the config
  const sanitized = sanitizeConfig(config as unknown as GeneratedConfig);
  return { valid: true, errors: [], config: sanitized };
}

function validateSection(
  section: Record<string, unknown>,
  index: number,
  existingIds: Set<string>
): string[] {
  const errors: string[] = [];
  const prefix = `sections[${index}]`;

  if (!section.id || typeof section.id !== 'string') {
    errors.push(`${prefix}: Missing or invalid id`);
  } else if (existingIds.has(section.id as string)) {
    errors.push(`${prefix}: Duplicate id "${section.id}"`);
  }

  if (!section.type || typeof section.type !== 'string') {
    errors.push(`${prefix}: Missing or invalid type`);
  } else if (!VALID_SECTION_TYPES.includes(section.type as string)) {
    errors.push(`${prefix}: Invalid section type "${section.type}"`);
  }

  if (typeof section.order !== 'number') {
    errors.push(`${prefix}: Missing or invalid order`);
  }

  if (typeof section.enabled !== 'boolean') {
    errors.push(`${prefix}: Missing or invalid enabled`);
  }

  if (!section.content || typeof section.content !== 'object') {
    errors.push(`${prefix}: Missing or invalid content`);
  }

  return errors;
}

function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

function sanitizeConfig(config: GeneratedConfig): GeneratedConfig {
  // Ensure fonts are from allowed list or use fallbacks
  const fonts = {
    display: VALID_FONTS.display.includes(config.fonts.display)
      ? config.fonts.display
      : 'Playfair Display',
    body: VALID_FONTS.body.includes(config.fonts.body)
      ? config.fonts.body
      : 'Source Serif Pro',
    arabic: VALID_FONTS.arabic.includes(config.fonts.arabic)
      ? config.fonts.arabic
      : 'Tajawal',
  };

  // Sanitize colors
  const colors = {
    primary: sanitizeColor(config.colors.primary, '#0054A6'),
    accent: sanitizeColor(config.colors.accent, '#F7941D'),
    background: sanitizeColor(config.colors.background, '#ffffff'),
    text: sanitizeColor(config.colors.text, '#1e293b'),
    headerBg: sanitizeColor(config.colors.headerBg, '#ffffff'),
    footerBg: sanitizeColor(config.colors.footerBg, '#1e293b'),
  };

  // Sanitize sections
  const sections = config.sections
    .filter((s) => VALID_SECTION_TYPES.includes(s.type))
    .map((section, index) => ({
      ...section,
      id: section.id || `section-${index}`,
      order: section.order ?? index,
      enabled: section.enabled ?? true,
      content: sanitizeContent(section.content),
    }));

  return {
    aestheticDirection: config.aestheticDirection || 'Custom design',
    fonts,
    colors,
    sections,
  };
}

function sanitizeColor(color: string, fallback: string): string {
  if (isValidHexColor(color)) {
    return color;
  }
  return fallback;
}

// Allowed fields in section content (matches Convex schema)
const ALLOWED_CONTENT_FIELDS = [
  'title',
  'titleAr',
  'subtitle',
  'subtitleAr',
  'imageKey',
  'backgroundColor',
  'textColor',
  'ctaText',
  'ctaTextAr',
  'ctaLink',
  'items',
  'productsPerRow',
  'productCount',
  'showFilters',
  'layout',
];

function sanitizeContent(
  content: GeneratedConfig['sections'][0]['content']
): GeneratedConfig['sections'][0]['content'] {
  // Only keep allowed fields
  const sanitized: Record<string, unknown> = {};

  for (const key of ALLOWED_CONTENT_FIELDS) {
    if (key in content && content[key as keyof typeof content] !== undefined) {
      sanitized[key] = content[key as keyof typeof content];
    }
  }

  // Sanitize colors in content
  if (sanitized.backgroundColor && !isValidHexColor(sanitized.backgroundColor as string)) {
    delete sanitized.backgroundColor;
  }
  if (sanitized.textColor && !isValidHexColor(sanitized.textColor as string)) {
    delete sanitized.textColor;
  }

  // Convert columns to productsPerRow if present (common AI mistake)
  if ('columns' in content && !sanitized.productsPerRow) {
    sanitized.productsPerRow = content['columns' as keyof typeof content] as number;
  }

  return sanitized as GeneratedConfig['sections'][0]['content'];
}

// Check if text contains Arabic characters
export function containsArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicPattern.test(text);
}

// Validate that Arabic fields actually contain Arabic
export function validateArabicContent(config: GeneratedConfig): string[] {
  const warnings: string[] = [];

  for (const section of config.sections) {
    if (section.content.titleAr && !containsArabic(section.content.titleAr)) {
      warnings.push(
        `Section "${section.id}": titleAr does not contain Arabic characters`
      );
    }
    if (
      section.content.subtitleAr &&
      !containsArabic(section.content.subtitleAr)
    ) {
      warnings.push(
        `Section "${section.id}": subtitleAr does not contain Arabic characters`
      );
    }
    if (section.content.ctaTextAr && !containsArabic(section.content.ctaTextAr)) {
      warnings.push(
        `Section "${section.id}": ctaTextAr does not contain Arabic characters`
      );
    }
    if (section.content.items) {
      for (let i = 0; i < section.content.items.length; i++) {
        const item = section.content.items[i];
        if (item.titleAr && !containsArabic(item.titleAr)) {
          warnings.push(
            `Section "${section.id}" item ${i}: titleAr does not contain Arabic`
          );
        }
        if (item.descriptionAr && !containsArabic(item.descriptionAr)) {
          warnings.push(
            `Section "${section.id}" item ${i}: descriptionAr does not contain Arabic`
          );
        }
      }
    }
  }

  return warnings;
}
