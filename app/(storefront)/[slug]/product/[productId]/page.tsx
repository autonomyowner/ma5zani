'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productId = params.productId as Id<'products'>;

  const { addItem, getItemQuantity, removeItem, updateQuantity } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const data = useQuery(api.publicOrders.getPublicProduct, { slug, productId });

  // Loading state
  if (data === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-500 mb-6">This product doesn&apos;t exist or is not available.</p>
          <Link
            href={`/${slug}`}
            className="inline-block px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { product, category, relatedProducts, storefront } = data;
  const images = product.imageKeys && product.imageKeys.length > 0 ? product.imageKeys : [];
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice ?? product.price;
  const isOutOfStock = product.status === 'out_of_stock';
  const cartQuantity = getItemQuantity(product._id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        imageKey: product.imageKeys?.[0],
        stock: product.stock,
      });
    }
    setQuantity(1);
  };

  return (
    <StorefrontLayout storefront={storefront}>
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li>
            <Link href={`/${slug}`} className="hover:text-slate-900">
              {storefront.boutiqueName}
            </Link>
          </li>
          <li>/</li>
          {category && (
            <>
              <li className="text-slate-400">{category.name}</li>
              <li>/</li>
            </>
          )}
          <li className="text-slate-900 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image Gallery - Shopify Style */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative">
            {images.length > 0 ? (
              <img
                src={getR2PublicUrl(images[selectedImageIndex])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Sale Badge */}
            {isOnSale && !isOutOfStock && (
              <span
                className="absolute top-4 left-4 px-3 py-1.5 text-sm font-semibold text-white rounded-lg"
                style={{ backgroundColor: storefront.theme.accentColor }}
              >
                Sale
              </span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg text-lg">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((imageKey, index) => (
                <button
                  key={imageKey}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-slate-900'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={getR2PublicUrl(imageKey)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          {/* Category */}
          {category && (
            <p className="text-sm text-slate-500 mb-2">{category.name}</p>
          )}

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="text-3xl font-bold"
              style={{ color: storefront.theme.accentColor }}
            >
              {displayPrice.toLocaleString()} DZD
            </span>
            {isOnSale && (
              <span className="text-xl text-slate-400 line-through">
                {product.price.toLocaleString()} DZD
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock
                  ? 'bg-red-500'
                  : product.status === 'low_stock'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            />
            <span className="text-sm text-slate-600">
              {isOutOfStock
                ? 'Out of stock'
                : product.status === 'low_stock'
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="font-medium text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          {!isOutOfStock && (
            <div className="space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-r-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: storefront.theme.accentColor }}
              >
                {cartQuantity > 0 ? `Add More (${cartQuantity} in cart)` : 'Add to Cart'}
              </button>

              {/* Continue Shopping */}
              <Link
                href={`/${slug}`}
                className="block text-center text-sm text-slate-500 hover:text-slate-700"
              >
                Continue Shopping
              </Link>
            </div>
          )}

          {/* Out of Stock Message */}
          {isOutOfStock && (
            <div className="bg-slate-100 rounded-xl p-6 text-center">
              <p className="text-slate-600 mb-4">This product is currently out of stock.</p>
              <Link
                href={`/${slug}`}
                className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
              >
                Browse Other Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-200 pt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => {
              const relatedImage = relatedProduct.imageKeys?.[0];
              const relatedIsOnSale = relatedProduct.salePrice && relatedProduct.salePrice < relatedProduct.price;
              const relatedDisplayPrice = relatedProduct.salePrice ?? relatedProduct.price;

              return (
                <Link
                  key={relatedProduct._id}
                  href={`/${slug}/product/${relatedProduct._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {relatedImage ? (
                        <img
                          src={getR2PublicUrl(relatedImage)}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {relatedIsOnSale && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold text-white rounded"
                          style={{ backgroundColor: storefront.theme.accentColor }}
                        >
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-slate-900 text-sm truncate">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold" style={{ color: storefront.theme.accentColor }}>
                          {relatedDisplayPrice.toLocaleString()} DZD
                        </span>
                        {relatedIsOnSale && (
                          <span className="text-xs text-slate-400 line-through">
                            {relatedProduct.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
}
