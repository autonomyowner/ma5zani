// AI Storefront Builder - Context Builder
// Builds context from seller's products and current storefront

import { Doc } from '@/convex/_generated/dataModel';
import { AIContext } from './prompts';

export interface StorefrontData {
  storefront: Doc<'storefronts'> | null;
  products: Doc<'products'>[];
  categories: Doc<'categories'>[];
  seller: Doc<'sellers'> | null;
}

export function buildAIContext(data: StorefrontData): AIContext {
  const { storefront, products, categories, seller } = data;

  // Detect business type from products and categories
  const businessType = detectBusinessType(products, categories);

  // Get existing sections if any
  const currentSections = storefront?.sections?.map((s) => ({
    id: s.id,
    type: s.type,
    order: s.order,
    enabled: s.enabled,
    content: s.content as Record<string, unknown>,
  }));

  return {
    seller: {
      name: seller?.name || 'Store',
      businessType,
    },
    boutiqueName: storefront?.boutiqueName,
    products: products.slice(0, 20).map((p) => ({
      name: p.name,
      category: categories.find((c) => c._id === p.categoryId)?.name,
      price: p.price,
    })),
    categories: categories.map((c) => ({
      name: c.name,
      nameAr: c.nameAr,
    })),
    currentSections,
    currentColors: storefront?.colors,
    currentFonts: storefront?.fonts,
  };
}

function detectBusinessType(
  products: Doc<'products'>[],
  categories: Doc<'categories'>[]
): string | undefined {
  const categoryNames = categories.map((c) => c.name.toLowerCase());
  const productNames = products.map((p) => p.name.toLowerCase()).join(' ');
  const allText = [...categoryNames, productNames].join(' ');

  // Fashion/Clothing
  if (
    allText.match(
      /clothing|dress|shirt|pants|hijab|abaya|gandoura|karakou|fashion|wear|جلابة|قندورة|حجاب|ملابس/i
    )
  ) {
    return 'fashion/traditional clothing';
  }

  // Electronics/Tech
  if (
    allText.match(
      /phone|laptop|electronic|tech|computer|mobile|tablet|هاتف|لابتوب|إلكترونيات/i
    )
  ) {
    return 'tech/electronics';
  }

  // Food/Grocery
  if (
    allText.match(
      /food|grocery|organic|honey|oil|date|تمر|عسل|زيت|طعام|بقالة/i
    )
  ) {
    return 'food/organic';
  }

  // Beauty/Cosmetics
  if (
    allText.match(
      /beauty|cosmetic|skincare|makeup|cream|serum|مكياج|تجميل|كريم/i
    )
  ) {
    return 'beauty/cosmetics';
  }

  // Jewelry/Accessories
  if (
    allText.match(
      /jewelry|jewellery|ring|necklace|bracelet|gold|silver|مجوهرات|ذهب|فضة|خاتم/i
    )
  ) {
    return 'jewelry/accessories';
  }

  // Home/Decor
  if (
    allText.match(
      /home|decor|furniture|carpet|rug|سجاد|أثاث|ديكور|منزل/i
    )
  ) {
    return 'home/decor';
  }

  // Traditional/Artisan
  if (
    allText.match(
      /traditional|artisan|handmade|craft|heritage|تراث|تقليدي|يدوي|حرفي/i
    )
  ) {
    return 'traditional/artisan';
  }

  return undefined;
}

// Build a summary of the storefront for preview
export function buildStorefrontSummary(
  config: GeneratedConfig
): StorefrontSummary {
  return {
    aestheticDirection: config.aestheticDirection,
    sectionCount: config.sections.length,
    enabledSections: config.sections.filter((s) => s.enabled).map((s) => s.type),
    fonts: config.fonts,
    primaryColor: config.colors.primary,
    accentColor: config.colors.accent,
  };
}

export interface GeneratedConfig {
  aestheticDirection: string;
  fonts: {
    display: string;
    body: string;
    arabic: string;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    footerBg: string;
  };
  sections: Array<{
    id: string;
    type: string;
    order: number;
    enabled: boolean;
    content: {
      title?: string;
      titleAr?: string;
      subtitle?: string;
      subtitleAr?: string;
      backgroundColor?: string;
      textColor?: string;
      ctaText?: string;
      ctaTextAr?: string;
      ctaLink?: string;
      items?: Array<{
        title: string;
        titleAr?: string;
        description?: string;
        descriptionAr?: string;
        imageKey?: string;
        link?: string;
      }>;
      productsPerRow?: number;
      productCount?: number;
      showFilters?: boolean;
    };
  }>;
}

export interface StorefrontSummary {
  aestheticDirection: string;
  sectionCount: number;
  enabledSections: string[];
  fonts: {
    display: string;
    body: string;
    arabic: string;
  };
  primaryColor: string;
  accentColor: string;
}
