import { StorefrontSection } from '@/components/storefront/sections';

// Classic template
// Replicates the original/legacy storefront look:
// Dark background, cream text, orange accents, elegant serif fonts
// Simple layout: just categories and product grid (no hero, no banner)

export const classicTemplate: StorefrontSection[] = [
  {
    id: 'categories-1',
    type: 'categories',
    order: 0,
    enabled: true,
    content: {
      layout: 'scroll',
    },
  },
  {
    id: 'grid-1',
    type: 'grid',
    order: 1,
    enabled: true,
    content: {
      title: 'Products',
      titleAr: 'المنتجات',
      productsPerRow: 4,
      showFilters: false,
    },
  },
];

// The original dark elegant color scheme
export const classicColors = {
  primary: '#0a0a0a',
  accent: '#F7941D',
  background: '#0a0a0a',
  text: '#f5f5dc',
  headerBg: '#0a0a0a',
  footerBg: '#0a0a0a',
};

// Default footer configuration
export const classicFooter = {
  showPoweredBy: true,
  customText: undefined,
  links: [],
};
