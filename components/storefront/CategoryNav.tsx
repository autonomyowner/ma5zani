'use client';

import { Doc, Id } from '@/convex/_generated/dataModel';

interface CategoryNavProps {
  categories: Doc<'categories'>[];
  selectedCategory: Id<'categories'> | null;
  onSelectCategory: (categoryId: Id<'categories'> | null) => void;
  primaryColor: string;
}

export default function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor,
}: CategoryNavProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? 'text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          style={{
            backgroundColor: selectedCategory === null ? primaryColor : undefined,
          }}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onSelectCategory(category._id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category._id
                ? 'text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            style={{
              backgroundColor: selectedCategory === category._id ? primaryColor : undefined,
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
