'use client';

import { Doc } from '@/convex/_generated/dataModel';
import HeroSection from './HeroSection';
import AnnouncementBar from './AnnouncementBar';
import FeaturedProducts from './FeaturedProducts';
import FeaturesBanner from './FeaturesBanner';
import FeaturedCollection from './FeaturedCollection';
import NewsletterSection from './NewsletterSection';
import AboutSection from './AboutSection';
import CategoryNav from '../CategoryNav';
import ProductGrid from '../ProductGrid';

// Section type definition
export interface StorefrontSection {
  id: string;
  type: string;
  order: number;
  enabled: boolean;
  content: {
    title?: string;
    titleAr?: string;
    subtitle?: string;
    subtitleAr?: string;
    imageKey?: string;
    backgroundColor?: string;
    textColor?: string;
    ctaText?: string;
    ctaTextAr?: string;
    ctaLink?: string;
    items?: unknown[];
    productsPerRow?: number;
    productCount?: number;
    showFilters?: boolean;
    layout?: string;
  };
}

interface SectionRendererProps {
  section: StorefrontSection;
  products: Doc<'products'>[];
  categories: Doc<'categories'>[];
  primaryColor: string;
  accentColor: string;
  selectedCategory?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}

export default function SectionRenderer({
  section,
  products,
  categories,
  primaryColor,
  accentColor,
  selectedCategory,
  onSelectCategory,
}: SectionRendererProps) {
  if (!section.enabled) return null;

  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          content={section.content}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      );

    case 'announcement':
      return (
        <AnnouncementBar
          content={section.content}
          primaryColor={primaryColor}
        />
      );

    case 'featured':
      return (
        <FeaturedProducts
          content={section.content}
          products={products}
          accentColor={accentColor}
        />
      );

    case 'features':
      return (
        <FeaturesBanner
          content={section.content as { items?: { title: string; titleAr?: string; description: string; descriptionAr?: string }[] } & typeof section.content}
          primaryColor={primaryColor}
        />
      );

    case 'collection':
      return (
        <FeaturedCollection
          content={section.content as { items?: { title: string; titleAr?: string; imageKey?: string; link: string }[] } & typeof section.content}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      );

    case 'newsletter':
      return (
        <NewsletterSection
          content={section.content}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      );

    case 'about':
      return (
        <AboutSection
          content={section.content}
          primaryColor={primaryColor}
        />
      );

    case 'categories':
      if (categories.length === 0) return null;
      return (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory as Doc<'categories'>['_id'] | null}
            onSelectCategory={(id) => onSelectCategory?.(id)}
            primaryColor={primaryColor}
          />
        </div>
      );

    case 'grid':
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {section.content.title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 text-center"
              style={{ color: section.content.textColor || '#1e293b' }}
            >
              {section.content.title}
            </h2>
          )}
          <ProductGrid products={products} accentColor={accentColor} />
        </div>
      );

    default:
      return null;
  }
}
