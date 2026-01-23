'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { getR2PublicUrl } from '@/lib/r2';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';

export default function StorefrontProductsPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const products = useQuery(api.products.getProducts);
  const categories = useQuery(api.categories.getCategories);
  const updateProduct = useMutation(api.products.updateProduct);

  const [editingProduct, setEditingProduct] = useState<Id<'products'> | null>(null);
  const [editData, setEditData] = useState<{
    imageKeys: string[];
    categoryId: Id<'categories'> | undefined;
    salePrice: number | undefined;
  }>({
    imageKeys: [],
    categoryId: undefined,
    salePrice: undefined,
  });

  const handleToggleVisibility = async (productId: Id<'products'>, currentValue: boolean) => {
    await updateProduct({
      productId,
      showOnStorefront: !currentValue,
    });
  };

  const handleEdit = (product: NonNullable<typeof products>[0]) => {
    setEditingProduct(product._id);
    setEditData({
      imageKeys: product.imageKeys || [],
      categoryId: product.categoryId,
      salePrice: product.salePrice,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    await updateProduct({
      productId: editingProduct,
      imageKeys: editData.imageKeys,
      categoryId: editData.categoryId,
      salePrice: editData.salePrice,
    });
    setEditingProduct(null);
  };

  if (!products) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          {isRTL ? 'منتجات المتجر' : 'Storefront Products'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isRTL
            ? 'اختر المنتجات التي تريد عرضها في متجرك'
            : 'Select which products to display on your storefront'}
        </p>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {isRTL
                ? 'لا توجد منتجات. أضف منتجات من صفحة المنتجات أولاً.'
                : 'No products. Add products from the Products page first.'}
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Toggle */}
                  <button
                    onClick={() =>
                      handleToggleVisibility(product._id, product.showOnStorefront || false)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      product.showOnStorefront ? 'bg-[#22B14C]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        product.showOnStorefront
                          ? isRTL
                            ? 'left-1'
                            : 'right-1'
                          : isRTL
                          ? 'right-1'
                          : 'left-1'
                      }`}
                    />
                  </button>

                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageKeys && product.imageKeys.length > 0 ? (
                      <img
                        src={getR2PublicUrl(product.imageKeys[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        {isRTL ? 'لا صورة' : 'No image'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-500">
                        {product.price.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                      </span>
                      {product.salePrice && (
                        <span className="text-sm text-green-600 font-medium">
                          {product.salePrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'low_stock'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.stock} {isRTL ? 'في المخزون' : 'in stock'}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(product)}
                    className="text-sm"
                  >
                    {isRTL ? 'تعديل' : 'Edit'}
                  </Button>
                </div>

                {/* Edit Panel */}
                {editingProduct === product._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'صور المنتج' : 'Product Images'}
                      </label>
                      <ImageUpload
                        value={editData.imageKeys}
                        onChange={(keys) => setEditData({ ...editData, imageKeys: keys })}
                        maxImages={5}
                        folder="products"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'الفئة' : 'Category'}
                      </label>
                      <select
                        value={editData.categoryId || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            categoryId: e.target.value
                              ? (e.target.value as Id<'categories'>)
                              : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                      >
                        <option value="">{isRTL ? 'بدون فئة' : 'No category'}</option>
                        {categories?.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {isRTL ? cat.nameAr : cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sale Price */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'سعر التخفيض' : 'Sale Price'}{' '}
                        <span className="text-slate-400 font-normal">
                          ({isRTL ? 'اختياري' : 'optional'})
                        </span>
                      </label>
                      <Input
                        type="number"
                        value={editData.salePrice || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            salePrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder={`${isRTL ? 'السعر الأصلي:' : 'Original:'} ${product.price}`}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={handleSaveEdit}>
                        {isRTL ? 'حفظ' : 'Save'}
                      </Button>
                      <Button variant="secondary" onClick={() => setEditingProduct(null)}>
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
