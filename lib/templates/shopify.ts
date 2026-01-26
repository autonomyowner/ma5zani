import { StorefrontSection } from '@/components/storefront/sections';

// Shopify-style default template
// Full-featured layout with hero, features, categories, and product grid

export const shopifyTemplate: StorefrontSection[] = [
  {
    id: 'announcement-1',
    type: 'announcement',
    order: 0,
    enabled: true,
    content: {
      title: 'Free shipping on all orders',
      titleAr: 'شحن مجاني على جميع الطلبات',
      backgroundColor: '', // Will use primary color
      textColor: '#ffffff',
    },
  },
  {
    id: 'hero-1',
    type: 'hero',
    order: 1,
    enabled: true,
    content: {
      title: 'Welcome to Our Store',
      titleAr: 'مرحباً بك في متجرنا',
      subtitle: 'Discover our exclusive collection',
      subtitleAr: 'اكتشف مجموعتنا الحصرية',
      ctaText: 'Shop Now',
      ctaTextAr: 'تسوق الآن',
      ctaLink: '#products',
      backgroundColor: '', // Will use primary color
      textColor: '#ffffff',
    },
  },
  {
    id: 'features-1',
    type: 'features',
    order: 2,
    enabled: true,
    content: {
      backgroundColor: '#f8fafc',
      items: [
        {
          title: 'Free Shipping',
          titleAr: 'شحن مجاني',
          description: 'On all orders',
          descriptionAr: 'على جميع الطلبات',
        },
        {
          title: 'Secure Payment',
          titleAr: 'دفع آمن',
          description: 'Cash on delivery',
          descriptionAr: 'الدفع عند الاستلام',
        },
        {
          title: '24/7 Support',
          titleAr: 'دعم متواصل',
          description: "We're here to help",
          descriptionAr: 'نحن هنا لمساعدتك',
        },
        {
          title: 'Easy Returns',
          titleAr: 'إرجاع سهل',
          description: 'Hassle-free returns',
          descriptionAr: 'إرجاع بدون متاعب',
        },
      ],
    },
  },
  {
    id: 'featured-1',
    type: 'featured',
    order: 3,
    enabled: true,
    content: {
      title: 'Featured Products',
      titleAr: 'منتجات مميزة',
      productCount: 4,
    },
  },
  {
    id: 'categories-1',
    type: 'categories',
    order: 4,
    enabled: true,
    content: {
      layout: 'scroll',
    },
  },
  {
    id: 'grid-1',
    type: 'grid',
    order: 5,
    enabled: true,
    content: {
      title: 'All Products',
      titleAr: 'جميع المنتجات',
      productsPerRow: 4,
      showFilters: false,
    },
  },
  {
    id: 'newsletter-1',
    type: 'newsletter',
    order: 6,
    enabled: false, // Disabled by default
    content: {
      title: 'Subscribe to our newsletter',
      titleAr: 'اشترك في النشرة البريدية',
      subtitle: 'Get the latest deals and updates',
      subtitleAr: 'احصل على آخر العروض والتحديثات',
    },
  },
];

// Color presets for Shopify template
export const shopifyColors = {
  primary: '#0054A6',
  accent: '#F7941D',
  background: '#ffffff',
  text: '#1e293b',
  headerBg: '#ffffff',
  footerBg: '#ffffff',
};

// Default footer configuration
export const shopifyFooter = {
  showPoweredBy: true,
  customText: undefined,
  links: [],
};
