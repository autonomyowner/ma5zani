'use client';

import { Doc } from '@/convex/_generated/dataModel';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Doc<'products'>[];
  accentColor: string;
}

export default function ProductGrid({ products, accentColor }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-slate-500">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} accentColor={accentColor} />
      ))}
    </div>
  );
}
