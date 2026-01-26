import { StorefrontSection } from '@/components/storefront/sections';
import { shopifyTemplate, shopifyColors, shopifyFooter } from './shopify';
import { minimalTemplate, minimalColors, minimalFooter } from './minimal';

export interface TemplateConfig {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sections: StorefrontSection[];
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    footerBg: string;
  };
  footer: {
    showPoweredBy: boolean;
    customText?: string;
    links: { label: string; labelAr?: string; url: string }[];
  };
}

export const templates: Record<string, TemplateConfig> = {
  shopify: {
    id: 'shopify',
    name: 'Shopify Style',
    nameAr: 'ستايل شوبيفاي',
    description: 'Full-featured layout with hero, features, and product grid',
    descriptionAr: 'تصميم كامل مع صورة رئيسية ومميزات وشبكة منتجات',
    sections: shopifyTemplate,
    colors: shopifyColors,
    footer: shopifyFooter,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    description: 'Clean and simple layout with just products',
    descriptionAr: 'تصميم نظيف وبسيط مع المنتجات فقط',
    sections: minimalTemplate,
    colors: minimalColors,
    footer: minimalFooter,
  },
};

export const getTemplate = (templateId: string): TemplateConfig => {
  return templates[templateId] || templates.shopify;
};

export const getDefaultSections = (): StorefrontSection[] => {
  return shopifyTemplate;
};

// Section type labels for the editor
export const sectionTypeLabels: Record<string, { en: string; ar: string }> = {
  hero: { en: 'Hero Banner', ar: 'صورة رئيسية' },
  announcement: { en: 'Announcement Bar', ar: 'شريط إعلانات' },
  featured: { en: 'Featured Products', ar: 'منتجات مميزة' },
  categories: { en: 'Categories', ar: 'الأقسام' },
  grid: { en: 'Product Grid', ar: 'شبكة المنتجات' },
  features: { en: 'Features Banner', ar: 'شريط المميزات' },
  collection: { en: 'Featured Collection', ar: 'مجموعة مميزة' },
  newsletter: { en: 'Newsletter', ar: 'النشرة البريدية' },
  about: { en: 'About Section', ar: 'قسم عن المتجر' },
};

// Available section types that can be added
export const availableSectionTypes = [
  'hero',
  'announcement',
  'featured',
  'categories',
  'grid',
  'features',
  'collection',
  'newsletter',
  'about',
];
