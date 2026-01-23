'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/CartContext';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import CategoryNav from '@/components/storefront/CategoryNav';
import ProductGrid from '@/components/storefront/ProductGrid';

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setStorefrontSlug } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<Id<'categories'> | null>(null);

  const storefront = useQuery(api.storefronts.getStorefrontBySlug, { slug });
  const productsData = useQuery(api.publicOrders.getStorefrontProducts, { slug });

  // Set storefront slug for cart
  useEffect(() => {
    if (slug) {
      setStorefrontSlug(slug);
    }
  }, [slug, setStorefrontSlug]);

  // Loading state
  if (storefront === undefined || productsData === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
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

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <StorefrontLayout storefront={storefront}>
      {/* Store Description */}
      {storefront.description && (
        <div className="text-center mb-8">
          <p className="text-slate-600 max-w-2xl mx-auto">{storefront.description}</p>
        </div>
      )}

      {/* Category Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        primaryColor={storefront.theme.primaryColor}
      />

      {/* Products Grid */}
      <ProductGrid products={filteredProducts} accentColor={storefront.theme.accentColor} />
    </StorefrontLayout>
  );
}
