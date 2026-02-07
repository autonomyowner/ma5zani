'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import WilayaSelect from '@/components/storefront/WilayaSelect';
import Link from 'next/link';

// Helper to track Meta Pixel events
const trackPixelEvent = (eventName: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) {
    (window as unknown as { fbq: (action: string, event: string, data?: Record<string, unknown>) => void }).fbq(
      'track',
      eventName,
      data
    );
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as Id<'products'>;
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const orderFormRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { addItem, getItemQuantity } = useCart();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const data = useQuery(api.publicOrders.getPublicProduct, { slug, productId });
  const createOrder = useMutation(api.publicOrders.createPublicOrder);

  // Handle touch swipe for mobile gallery
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent, imagesLength: number) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next image
        setSelectedImageIndex((prev) => (prev === imagesLength - 1 ? 0 : prev + 1));
      } else {
        // Swipe right - previous image
        setSelectedImageIndex((prev) => (prev === 0 ? imagesLength - 1 : prev - 1));
      }
    }
    setTouchStart(null);
  };

  // Sticky bar: show when order form scrolls out of view (mobile only)
  useEffect(() => {
    const el = orderFormRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data]);

  // Handle order submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone || !wilaya || !deliveryAddress) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (!data) return;

    setSubmitting(true);
    try {
      const result = await createOrder({
        storefrontSlug: slug,
        items: [{
          productId: data.product._id,
          quantity: quantity,
        }],
        customerName,
        customerPhone,
        wilaya,
        deliveryAddress,
      });

      // Track Meta Pixel Purchase event
      if (data.storefront.metaPixelId) {
        const displayPrice = data.product.salePrice ?? data.product.price;
        trackPixelEvent('Purchase', {
          value: displayPrice * quantity,
          currency: 'DZD',
          content_ids: [data.product._id],
          content_type: 'product',
          num_items: quantity,
        });
      }

      router.push(`/${slug}/order-success/${result.orderIds[0]}`);
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل إرسال الطلب' : 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state - Skeleton
  if (data === undefined) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="h-20" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="aspect-square rounded-xl bg-white/5 skeleton-shimmer" />
            {/* Info skeleton */}
            <div className="space-y-4 pt-4">
              <div className="w-20 h-3 rounded bg-white/10 skeleton-shimmer" />
              <div className="w-3/4 h-6 rounded bg-white/10 skeleton-shimmer" />
              <div className="w-1/3 h-8 rounded bg-white/10 skeleton-shimmer" />
              <div className="w-24 h-3 rounded bg-white/10 skeleton-shimmer" />
              <div className="mt-8 space-y-3">
                <div className="w-full h-4 rounded bg-white/10 skeleton-shimmer" />
                <div className="w-5/6 h-4 rounded bg-white/10 skeleton-shimmer" />
                <div className="w-2/3 h-4 rounded bg-white/10 skeleton-shimmer" />
              </div>
              <div className="mt-8 rounded-xl bg-white/5 p-6 space-y-4">
                <div className="w-1/3 h-4 rounded bg-white/10 skeleton-shimmer" />
                <div className="w-full h-10 rounded bg-white/10 skeleton-shimmer" />
                <div className="w-full h-10 rounded bg-white/10 skeleton-shimmer" />
                <div className="w-full h-12 rounded bg-white/10 skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {isRTL ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <p className="text-slate-500 mb-6">
            {isRTL ? 'هذا المنتج غير متوفر' : 'This product doesn\'t exist or is not available.'}
          </p>
          <Link
            href={`/${slug}`}
            className="inline-block px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90"
          >
            {isRTL ? 'العودة للمتجر' : 'Back to Store'}
          </Link>
        </div>
      </div>
    );
  }

  const { product, category, relatedProducts, storefront } = data;
  const images = product.imageKeys && product.imageKeys.length > 0 ? product.imageKeys : [];
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice ?? product.price;
  const totalPrice = displayPrice * quantity;
  const isOutOfStock = product.status === 'out_of_stock';
  const accentColor = storefront.theme.accentColor;

  return (
    <StorefrontLayout storefront={storefront}>
      {/* Breadcrumb - Hidden on mobile */}
      <nav className="hidden sm:block mb-6 px-4">
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

      {/* Back button on mobile */}
      <div className="sm:hidden px-4 mb-4">
        <Link href={`/${slug}`} className="inline-flex items-center gap-2 text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">{isRTL ? 'العودة' : 'Back'}</span>
        </Link>
      </div>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12 lg:mb-16">
        {/* Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image - Swipeable on mobile */}
          <div
            ref={imageContainerRef}
            className="aspect-square bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden relative mx-4 sm:mx-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, images.length)}
          >
            {images.length > 0 ? (
              <img
                src={getR2PublicUrl(images[selectedImageIndex])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <svg className="w-16 h-16 sm:w-24 sm:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Sale Badge */}
            {isOnSale && !isOutOfStock && (
              <span
                className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-white rounded-lg"
                style={{ backgroundColor: accentColor }}
              >
                {isRTL ? 'تخفيض' : 'Sale'}
              </span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-slate-900 font-semibold rounded-lg text-sm sm:text-lg">
                  {isRTL ? 'نفذ المخزون' : 'Out of Stock'}
                </span>
              </div>
            )}

            {/* Image dots indicator (mobile) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      selectedImageIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Image Navigation Arrows (desktop) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-colors"
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
            <div className="flex gap-2 sm:gap-3 px-4 sm:px-0 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
              {images.map((imageKey, index) => (
                <button
                  key={imageKey}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-auto sm:h-auto sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-colors ${
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

        {/* Product Info & Order Form */}
        <div className="px-4 sm:px-0 lg:sticky lg:top-8 lg:self-start">
          {/* Category */}
          {category && (
            <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
              {isRTL ? category.nameAr : category.name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: accentColor }}
            >
              {displayPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
            </span>
            {isOnSale && (
              <span className="text-base sm:text-xl text-slate-400 line-through">
                {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock
                  ? 'bg-red-500'
                  : product.status === 'low_stock'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            />
            <span className="text-xs sm:text-sm text-slate-600">
              {isOutOfStock
                ? (isRTL ? 'نفذ المخزون' : 'Out of stock')
                : product.status === 'low_stock'
                ? (isRTL ? `متبقي ${product.stock} فقط` : `Only ${product.stock} left`)
                : (isRTL ? `${product.stock} متوفر` : `${product.stock} in stock`)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 sm:mb-8">
              <h3 className="font-medium text-slate-900 mb-2 text-sm sm:text-base">
                {isRTL ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
            </div>
          )}

          {/* Order Form */}
          {!isOutOfStock ? (
            <div ref={orderFormRef} className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">
                {isRTL ? 'اطلب الآن' : 'Order Now'}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {isRTL ? 'الكمية' : 'Quantity'}
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white w-fit">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium text-sm sm:text-base">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                    placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                    placeholder="05XX XXX XXX"
                    required
                    dir="ltr"
                  />
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {isRTL ? 'الولاية *' : 'Wilaya *'}
                  </label>
                  <WilayaSelect value={wilaya} onChange={setWilaya} />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {isRTL ? 'عنوان التوصيل *' : 'Delivery Address *'}
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                    placeholder={isRTL ? 'الشارع، المبنى، الشقة...' : 'Street, building, apartment...'}
                    rows={2}
                    required
                  />
                </div>

                {/* Total & Submit */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-sm sm:text-base text-slate-600">
                      {isRTL ? 'المجموع' : 'Total'}
                    </span>
                    <span className="text-lg sm:text-xl font-bold" style={{ color: accentColor }}>
                      {totalPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    {isRTL ? 'الدفع عند الاستلام' : 'Cash on delivery (COD)'}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 sm:py-4 text-white font-semibold rounded-xl text-sm sm:text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                  >
                    {submitting
                      ? (isRTL ? 'جاري الإرسال...' : 'Placing Order...')
                      : (isRTL ? 'اشتري الآن' : 'Buy Now')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl sm:rounded-2xl p-6 text-center">
              <p className="text-slate-600 mb-4 text-sm sm:text-base">
                {isRTL ? 'هذا المنتج غير متوفر حالياً' : 'This product is currently out of stock.'}
              </p>
              <Link
                href={`/${slug}`}
                className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 text-sm sm:text-base"
              >
                {isRTL ? 'تصفح منتجات أخرى' : 'Browse Other Products'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-200 pt-8 sm:pt-12 px-4 sm:px-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
            {isRTL ? 'منتجات مشابهة' : 'You may also like'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
                          <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {relatedIsOnSale && (
                        <span
                          className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-white rounded"
                          style={{ backgroundColor: accentColor }}
                        >
                          {isRTL ? 'تخفيض' : 'Sale'}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h3 className="font-medium text-slate-900 text-xs sm:text-sm truncate">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: accentColor }}>
                          {relatedDisplayPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
                        </span>
                        {relatedIsOnSale && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">
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
      {/* Mobile Sticky Bottom Bar */}
      {!isOutOfStock && showStickyBar && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t backdrop-blur-md"
          style={{
            backgroundColor: `${storefront.colors?.background || '#ffffff'}f0`,
            borderColor: 'rgba(0,0,0,0.1)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-lg font-bold" style={{ color: accentColor }}>
                {displayPrice.toLocaleString()} {isRTL ? 'دج' : 'DZD'}
              </p>
              {isOnSale && (
                <p className="text-xs text-slate-400 line-through">
                  {product.price.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                addItem({
                  productId: product._id,
                  name: product.name,
                  price: product.price,
                  salePrice: product.salePrice,
                  imageKey: product.imageKeys?.[0],
                  stock: product.stock,
                });
              }}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
              }}
            >
              {getItemQuantity(product._id) > 0
                ? (isRTL ? `في السلة (${getItemQuantity(product._id)})` : `In Cart (${getItemQuantity(product._id)})`)
                : (isRTL ? 'أضف للسلة' : 'Add to Cart')}
            </button>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
