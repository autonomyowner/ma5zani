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
  backgroundColor?: string;
  textColor?: string;
  fonts?: {
    display: string;
    body: string;
    arabic: string;
  };
  selectedCategory?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function SectionRenderer({
  section,
  products,
  categories,
  primaryColor,
  accentColor,
  backgroundColor = '#0a0a0a',
  textColor = '#f5f5dc',
  fonts,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: SectionRendererProps) {
  if (!section.enabled) return null;

  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          content={section.content}
          primaryColor={primaryColor}
          accentColor={accentColor}
          fonts={fonts}
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
          accentColor={accentColor}
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
          accentColor={accentColor}
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
        <ProductGrid
          products={products}
          accentColor={accentColor}
          backgroundColor={section.content.backgroundColor || backgroundColor}
          textColor={section.content.textColor || textColor}
          productsPerRow={section.content.productsPerRow || 4}
          title={section.content.title}
          titleAr={section.content.titleAr}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      );

    default:
      return null;
  }
}
