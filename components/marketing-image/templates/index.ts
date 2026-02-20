import { LifestyleHero } from './LifestyleHero';
import { SplitScene } from './SplitScene';
import { Spotlight } from './Spotlight';
import { PromoCard } from './PromoCard';
import { MinimalLuxe } from './MinimalLuxe';

export interface MarketingTemplateProps {
  productImageUrl: string;
  sceneImageUrl?: string;
  productName: string;
  price: number;
  salePrice?: number;
  headline: string;
  subheadline: string;
  ctaText?: string;
  palette: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  format: 'square' | 'story' | 'facebook';
  storeName: string;
}

export const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  facebook: { width: 1200, height: 628 },
};

export interface TemplateDefinition {
  id: string;
  name: { ar: string; en: string; fr: string };
  component: React.ComponentType<MarketingTemplateProps>;
}

export const MARKETING_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'lifestyle-hero',
    name: { ar: 'صورة حية', en: 'Lifestyle Hero', fr: 'Hero Lifestyle' },
    component: LifestyleHero,
  },
  {
    id: 'split-scene',
    name: { ar: 'مشهد مقسوم', en: 'Split Scene', fr: 'Scene Divisee' },
    component: SplitScene,
  },
  {
    id: 'spotlight',
    name: { ar: 'تسليط الضوء', en: 'Spotlight', fr: 'Projecteur' },
    component: Spotlight,
  },
  {
    id: 'promo-card',
    name: { ar: 'بطاقة ترويج', en: 'Promo Card', fr: 'Carte Promo' },
    component: PromoCard,
  },
  {
    id: 'minimal-luxe',
    name: { ar: 'فخامة بسيطة', en: 'Minimal Luxe', fr: 'Luxe Minimal' },
    component: MinimalLuxe,
  },
];
