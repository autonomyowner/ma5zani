import { PosterLight } from './PosterLight';
import { PosterDark } from './PosterDark';

export interface PosterCopy {
  hookHeadline: string;
  subheadline: string;
  problem: string;
  solution: string;
  features: string[];
  trustBadges: string[];
  ctaText: string;
}

export interface PosterTemplateProps {
  productImageUrl: string;
  sceneImageUrl?: string;
  productName: string;
  price: number;
  salePrice?: number;
  copy: PosterCopy;
  palette: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  storeName: string;
  isDarkTheme?: boolean;
}

export const POSTER_DIMENSIONS = { width: 1080, height: 1920 };

export interface PosterTemplateDefinition {
  id: string;
  name: { ar: string; en: string; fr: string };
  component: React.ComponentType<PosterTemplateProps>;
}

export const POSTER_TEMPLATES: PosterTemplateDefinition[] = [
  {
    id: 'poster-light',
    name: { ar: 'ملصق فاتح', en: 'Light Poster', fr: 'Affiche Claire' },
    component: PosterLight,
  },
  {
    id: 'poster-dark',
    name: { ar: 'ملصق داكن', en: 'Dark Poster', fr: 'Affiche Sombre' },
    component: PosterDark,
  },
];
