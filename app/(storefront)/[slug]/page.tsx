'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/CartContext';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import CategoryNav from '@/components/storefront/CategoryNav';
import ProductGrid from '@/components/storefront/ProductGrid';
import SectionRenderer, { StorefrontSection } from '@/components/storefront/sections/SectionRenderer';

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setStorefrontSlug } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<Id<'categories'> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });
  const productsData = useQuery(api.publicOrders.getStorefrontProducts, { slug });

  // Set storefront slug for cart
  useEffect(() => {
    if (slug) {
      setStorefrontSlug(slug);
    }
  }, [slug, setStorefrontSlug]);

  // Get sections from storefront or use default template
  const sections = useMemo(() => {
    if (storefront?.sections && storefront.sections.length > 0) {
      return storefront.sections as StorefrontSection[];
    }
    return null; // Use legacy layout
  }, [storefront?.sections]);

  // Loading state - Skeleton
  if (storefront === undefined || productsData === undefined) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        {/* Header skeleton */}
        <div className="h-20 flex items-center justify-between px-6">
          <div className="w-16 h-3 rounded bg-white/10 skeleton-shimmer" />
          <div className="w-10 h-10 rounded-full bg-white/10 skeleton-shimmer" />
          <div className="w-12 h-3 rounded bg-white/10 skeleton-shimmer" />
        </div>
        {/* Hero skeleton */}
        <div className="w-full h-[60vh] bg-white/5 skeleton-shimmer" />
        {/* Products grid skeleton */}
        <div className="max-w-[1600px] mx-auto px-6 py-16">
          <div className="w-32 h-3 rounded bg-white/10 skeleton-shimmer mx-auto mb-4" />
          <div className="w-48 h-6 rounded bg-white/10 skeleton-shimmer mx-auto mb-12" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] rounded bg-white/5 skeleton-shimmer mb-4" />
                <div className="w-3/4 h-3 rounded bg-white/10 skeleton-shimmer mb-2" />
                <div className="w-1/2 h-3 rounded bg-white/10 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!storefront || !productsData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h1>
          <p className="text-slate-500 mb-6">This store doesn&apos;t exist or is not published.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90"
          >
            Go to ma5zani
          </a>
        </div>
      </div>
    );
  }

  const { products, categories } = productsData;

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get colors and fonts for sections
  const colors = {
    primary: storefront.colors?.primary || storefront.theme.primaryColor || '#0a0a0a',
    accent: storefront.colors?.accent || storefront.theme.accentColor || '#c9a962',
    background: storefront.colors?.background || '#0a0a0a',
    text: storefront.colors?.text || '#f5f5dc',
  };

  const fonts = storefront.fonts || {
    display: 'Playfair Display',
    body: 'Inter',
    arabic: 'Tajawal',
  };

  // If storefront has custom sections, render them dynamically
  if (sections && sections.length > 0) {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    return (
      <StorefrontLayout storefront={storefront}>
        {sortedSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            products={filteredProducts}
            categories={categories}
            primaryColor={colors.primary}
            accentColor={colors.accent}
            backgroundColor={colors.background}
            textColor={colors.text}
            fonts={fonts}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => setSelectedCategory(id as Id<'categories'> | null)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ))}
      </StorefrontLayout>
    );
  }

  // Legacy layout (no custom sections configured)
  return (
    <StorefrontLayout storefront={storefront}>
      {/* Store Description */}
      {storefront.description && (
        <div
          className="text-center py-12 px-6"
          style={{ backgroundColor: colors.background }}
        >
          <p
            className="text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            {storefront.description}
          </p>
        </div>
      )}

      {/* Category Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        primaryColor={colors.primary}
      />

      {/* Products Grid */}
      <ProductGrid
        products={filteredProducts}
        accentColor={colors.accent}
        backgroundColor={colors.background}
        textColor={colors.text}
        title="Products"
        titleAr="المنتجات"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </StorefrontLayout>
  );
}
