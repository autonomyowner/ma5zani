import { StorefrontSection } from '@/components/storefront/sections';

// Minimal template
// Clean layout with just categories and product grid

export const minimalTemplate: StorefrontSection[] = [
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
      productsPerRow: 4,
      showFilters: false,
    },
  },
];

// Color presets for Minimal template
export const minimalColors = {
  primary: '#1e293b',
  accent: '#3b82f6',
  background: '#ffffff',
  text: '#1e293b',
  headerBg: '#ffffff',
  footerBg: '#f8fafc',
};

// Default footer configuration
export const minimalFooter = {
  showPoweredBy: true,
  customText: undefined,
  links: [],
};
