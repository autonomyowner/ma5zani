'use client';

import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import ProductCard from '../ProductCard';

interface FeaturedProductsProps {
  content: {
    title?: string;
    titleAr?: string;
    productCount?: number;
    backgroundColor?: string;
    textColor?: string;
  };
  products: Doc<'products'>[];
  accentColor: string;
}

export default function FeaturedProducts({ content, products, accentColor }: FeaturedProductsProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const title = isRTL ? (content.titleAr || content.title) : content.title;
  const count = content.productCount || 4;

  // Get products with sale price as featured, or first N products
  const featuredProducts = products
    .filter(p => p.salePrice)
    .slice(0, count);

  // If not enough sale products, fill with regular products
  const displayProducts = featuredProducts.length >= count
    ? featuredProducts
    : [...featuredProducts, ...products.filter(p => !p.salePrice)].slice(0, count);

  if (displayProducts.length === 0) return null;

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: content.textColor || '#1e293b' }}
          >
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
