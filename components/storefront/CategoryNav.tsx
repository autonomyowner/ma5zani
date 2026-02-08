'use client';

import { Doc, Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { isLightColor } from '@/lib/colors';

interface CategoryNavProps {
  categories: Doc<'categories'>[];
  selectedCategory: Id<'categories'> | null;
  onSelectCategory: (categoryId: Id<'categories'> | null) => void;
  primaryColor: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor,
  backgroundColor = '#0a0a0a',
  textColor = '#f5f5dc',
}: CategoryNavProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  if (categories.length === 0) return null;

  const isLightBg = isLightColor(backgroundColor);
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const mutedText = isLightBg ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
  const btnBg = isLightBg ? '#ffffff' : '#1a1a1a';

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onSelectCategory(null)}
          className="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors"
          style={{
            backgroundColor: selectedCategory === null ? primaryColor : btnBg,
            color: selectedCategory === null
              ? (isLightColor(primaryColor) ? '#0a0a0a' : '#ffffff')
              : mutedText,
            border: selectedCategory === null ? 'none' : `1px solid ${borderColor}`,
          }}
        >
          {isRTL ? 'جميع المنتجات' : 'All Products'}
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onSelectCategory(category._id)}
            className="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors"
            style={{
              backgroundColor: selectedCategory === category._id ? primaryColor : btnBg,
              color: selectedCategory === category._id
                ? (isLightColor(primaryColor) ? '#0a0a0a' : '#ffffff')
                : mutedText,
              border: selectedCategory === category._id ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {isRTL ? (category.nameAr || category.name) : category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
