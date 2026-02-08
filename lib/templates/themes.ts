import { shopifyTemplate, shopifyFooter } from './shopify';
import { TemplateConfig } from './index';

// All themed templates reuse the shopify section layout with different color schemes

export const elegantDarkTemplate: TemplateConfig = {
  id: 'elegant-dark',
  name: 'Elegant Dark',
  nameAr: 'أناقة داكنة',
  description: 'Dark luxury theme with bold red accents',
  descriptionAr: 'ثيم فاخر داكن مع لمسات حمراء جريئة',
  sections: shopifyTemplate,
  colors: {
    primary: '#1a1a2e',
    accent: '#e94560',
    background: '#f5f5f5',
    text: '#1a1a2e',
    headerBg: '#1a1a2e',
    footerBg: '#1a1a2e',
  },
  footer: shopifyFooter,
};

export const oceanBreezeTemplate: TemplateConfig = {
  id: 'ocean-breeze',
  name: 'Ocean Breeze',
  nameAr: 'نسيم المحيط',
  description: 'Fresh blue theme inspired by the ocean',
  descriptionAr: 'ثيم أزرق منعش مستوحى من المحيط',
  sections: shopifyTemplate,
  colors: {
    primary: '#0077b6',
    accent: '#00b4d8',
    background: '#f0f9ff',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#f0f9ff',
  },
  footer: shopifyFooter,
};

export const roseGoldTemplate: TemplateConfig = {
  id: 'rose-gold',
  name: 'Rose Gold',
  nameAr: 'ذهبي وردي',
  description: 'Soft feminine theme with rose gold tones',
  descriptionAr: 'ثيم ناعم أنثوي بدرجات الذهبي الوردي',
  sections: shopifyTemplate,
  colors: {
    primary: '#b76e79',
    accent: '#f2c4c4',
    background: '#fdf6f6',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#fdf6f6',
  },
  footer: shopifyFooter,
};

export const forestTemplate: TemplateConfig = {
  id: 'forest',
  name: 'Forest',
  nameAr: 'الغابة',
  description: 'Natural green theme with earthy tones',
  descriptionAr: 'ثيم أخضر طبيعي بدرجات ترابية',
  sections: shopifyTemplate,
  colors: {
    primary: '#2d6a4f',
    accent: '#95d5b2',
    background: '#f0faf4',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#f0faf4',
  },
  footer: shopifyFooter,
};

export const sunsetTemplate: TemplateConfig = {
  id: 'sunset',
  name: 'Sunset',
  nameAr: 'غروب الشمس',
  description: 'Warm bold theme with sunset colors',
  descriptionAr: 'ثيم دافئ وجريء بألوان الغروب',
  sections: shopifyTemplate,
  colors: {
    primary: '#e63946',
    accent: '#f4a261',
    background: '#fff8f0',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#fff8f0',
  },
  footer: shopifyFooter,
};

export const slateProTemplate: TemplateConfig = {
  id: 'slate-pro',
  name: 'Slate Pro',
  nameAr: 'احترافي رمادي',
  description: 'Professional theme with indigo accents',
  descriptionAr: 'ثيم احترافي مع لمسات بنفسجية',
  sections: shopifyTemplate,
  colors: {
    primary: '#334155',
    accent: '#6366f1',
    background: '#f8fafc',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#f1f5f9',
  },
  footer: shopifyFooter,
};
