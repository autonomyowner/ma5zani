'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Doc } from '@/convex/_generated/dataModel';
import { useCart } from '@/lib/CartContext';
import { getR2PublicUrl } from '@/lib/r2';

interface ProductCardProps {
  product: Doc<'products'>;
  accentColor: string;
}

export default function ProductCard({ product, accentColor }: ProductCardProps) {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product._id);

  const images = product.imageKeys && product.imageKeys.length > 0 ? product.imageKeys : [];
  const imageUrl = images.length > 0 ? getR2PublicUrl(images[0]) : null;

  const isOnSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice ?? product.price;
  const isOutOfStock = product.status === 'out_of_stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      imageKey: product.imageKeys?.[0],
      stock: product.stock,
    });
  };

  return (
    <Link href={`/${slug}/product/${product._id}`} className="block">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="aspect-square bg-slate-100 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Multiple Images Indicator */}
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
              +{images.length - 1}
            </span>
          )}

          {/* Sale Badge */}
          {isOnSale && !isOutOfStock && (
            <span
              className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white rounded-lg"
              style={{ backgroundColor: accentColor }}
            >
              Sale
            </span>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-slate-900 font-semibold rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold" style={{ color: accentColor }}>
              {displayPrice.toLocaleString()} DZD
            </span>
            {isOnSale && (
              <span className="text-sm text-slate-400 line-through">
                {product.price.toLocaleString()} DZD
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'text-white hover:opacity-90'
            }`}
            style={{ backgroundColor: isOutOfStock ? undefined : accentColor }}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : quantity > 0
              ? `In Cart (${quantity})`
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
