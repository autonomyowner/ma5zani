'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getR2PublicUrl } from '@/lib/r2';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import { useCart } from '@/lib/CartContext';
import StorefrontLayout from '@/components/storefront/StorefrontLayout';
import WilayaSelect from '@/components/storefront/WilayaSelect';
import CommuneSelect from '@/components/storefront/CommuneSelect';
import Link from 'next/link';
import Image from 'next/image';
import { trackEvent, sendServerEvent, generateEventId, META_EVENTS } from '@/lib/meta-pixel';

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

  // Size/Color state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [deliveryType, setDeliveryType] = useState<'office' | 'home'>('office');
  const [commune, setCommune] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);

  // Fetch delivery fee when wilaya/deliveryType changes
  useEffect(() => {
    if (!wilaya) { setDeliveryFee(null); return; }
    const fetchFee = async () => {
      setLoadingFee(true);
      setDeliveryFee(null);
      try {
        const res = await fetch(
          `/api/delivery/fees?slug=${encodeURIComponent(slug)}&toWilaya=${encodeURIComponent(wilaya)}&deliveryType=${deliveryType}`
        );
        const feeData = await res.json();
        if (feeData.available) setDeliveryFee(feeData.fee);
        else setDeliveryFee(null);
      } catch { setDeliveryFee(null); }
      setLoadingFee(false);
    };
    fetchFee();
  }, [wilaya, deliveryType, slug]);

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
      setError(localText(language, { ar: 'يرجى ملء جميع الحقول', en: 'Please fill all fields', fr: 'Veuillez remplir tous les champs' }));
      return;
    }

    if (!data) return;

    // Validate size/color if product has them
    if (data.product.sizes && data.product.sizes.length > 0 && !selectedSize) {
      setError(localText(language, { ar: 'يرجى اختيار المقاس', en: 'Please select a size', fr: 'Veuillez choisir une taille' }));
      return;
    }
    if (data.product.colors && data.product.colors.length > 0 && !selectedColor) {
      setError(localText(language, { ar: 'يرجى اختيار اللون', en: 'Please select a color', fr: 'Veuillez choisir une couleur' }));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        storefrontSlug: slug,
        items: [{
          productId: data.product._id,
          quantity: quantity,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
        }],
        customerName,
        customerPhone,
        wilaya,
        commune: commune || undefined,
        deliveryType,
        deliveryAddress,
        deliveryFee: deliveryFee ?? undefined,
      });

      // Track Purchase with dedup (fires for both ma5zani pixel and storefront pixel)
      const purchaseEventId = generateEventId();
      const purchaseData = {
        value: (data.product.salePrice ?? data.product.price) * quantity,
        currency: 'DZD',
        content_ids: [data.product._id],
        content_type: 'product',
        num_items: quantity,
      };
      trackEvent(META_EVENTS.PURCHASE, purchaseData, purchaseEventId);
      sendServerEvent({
        eventName: META_EVENTS.PURCHASE,
        eventId: purchaseEventId,
        sourceUrl: window.location.href,
        userData: {
          phone: customerPhone,
          firstName: customerName.split(' ')[0],
          lastName: customerName.split(' ').slice(1).join(' ') || undefined,
        },
        customData: purchaseData,
      });

      router.push(`/${slug}/order-success/${result.orderIds[0]}`);
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : localText(language, { ar: 'فشل إرسال الطلب', en: 'Failed to place order', fr: 'Echec de la commande' }));
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
            {localText(language, { ar: 'المنتج غير موجود', en: 'Product Not Found', fr: 'Produit introuvable' })}
          </h1>
          <p className="text-slate-500 mb-6">
            {localText(language, { ar: 'هذا المنتج غير متوفر', en: "This product doesn't exist or is not available.", fr: "Ce produit n'existe pas ou n'est pas disponible." })}
          </p>
          <Link
            href={`/${slug}`}
            className="inline-block px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90"
          >
            {localText(language, { ar: 'العودة للمتجر', en: 'Back to Store', fr: 'Retour a la boutique' })}
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
  const accentColor = storefront.colors?.accent || storefront.theme.accentColor;
  const bgColor = storefront.colors?.background || '#0a0a0a';
  const txtColor = storefront.colors?.text || '#f5f5dc';

  // Derive theme-aware colors
  const isLightBg = (() => {
    const hex = bgColor.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
  })();
  const cardBg = isLightBg ? '#ffffff' : '#141414';
  const borderClr = isLightBg ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
  const textMuted = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const inputBg = isLightBg ? '#ffffff' : 'rgba(255,255,255,0.06)';
  const inputText = isLightBg ? '#1e293b' : '#f5f5dc';
  const formBg = isLightBg ? '#f8fafc' : 'rgba(255,255,255,0.04)';

  return (
    <StorefrontLayout storefront={storefront}>
      {/* Spacer for fixed header */}
      <div className="h-20 lg:h-24" />

      {/* Breadcrumb - Hidden on mobile */}
      <nav className="hidden sm:block mb-6 px-4">
        <ol className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
          <li>
            <Link href={`/${slug}`} className="hover:opacity-80">
              {storefront.boutiqueName}
            </Link>
          </li>
          <li>/</li>
          {category && (
            <>
              <li>{language === 'ar' ? category.nameAr : category.name}</li>
              <li>/</li>
            </>
          )}
          <li className="font-medium truncate" style={{ color: txtColor }}>{product.name}</li>
        </ol>
      </nav>

      {/* Back button on mobile */}
      <div className="sm:hidden px-4 mb-4">
        <Link href={`/${slug}`} className="inline-flex items-center gap-2" style={{ color: textMuted }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">{localText(language, { ar: 'العودة', en: 'Back', fr: 'Retour' })}</span>
        </Link>
      </div>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12 lg:mb-16">
        {/* Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image - Swipeable on mobile */}
          <div
            ref={imageContainerRef}
            className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden relative mx-4 sm:mx-0"
            style={{ backgroundColor: cardBg }}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, images.length)}
          >
            {images.length > 0 ? (
              <Image
                src={getR2PublicUrl(images[selectedImageIndex])}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority
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
                {localText(language, { ar: 'تخفيض', en: 'Sale', fr: 'Promo' })}
              </span>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-slate-900 font-semibold rounded-lg text-sm sm:text-lg">
                  {localText(language, { ar: 'نفذ المخزون', en: 'Out of Stock', fr: 'Rupture de stock' })}
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
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-auto sm:h-auto sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-slate-900'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <Image
                    src={getR2PublicUrl(imageKey)}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
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
            <p className="text-xs sm:text-sm mb-1 sm:mb-2" style={{ color: textMuted }}>
              {language === 'ar' ? category.nameAr : category.name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4" style={{ color: txtColor }}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: accentColor }}
            >
              {displayPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
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
            <span className="text-xs sm:text-sm" style={{ color: textMuted }}>
              {isOutOfStock
                ? localText(language, { ar: 'نفذ المخزون', en: 'Out of stock', fr: 'Rupture de stock' })
                : product.status === 'low_stock'
                ? localText(language, { ar: `متبقي ${product.stock} فقط`, en: `Only ${product.stock} left`, fr: `Plus que ${product.stock} en stock` })
                : localText(language, { ar: `${product.stock} متوفر`, en: `${product.stock} in stock`, fr: `${product.stock} en stock` })}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 sm:mb-8">
              <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: txtColor }}>
                {localText(language, { ar: 'الوصف', en: 'Description', fr: 'Description' })}
              </h3>
              <p className="leading-relaxed text-sm sm:text-base" style={{ color: textMuted }}>{product.description}</p>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: txtColor }}>
                {localText(language, { ar: 'المقاس', en: 'Size', fr: 'Taille' })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: selectedSize === size ? accentColor : inputBg,
                      color: selectedSize === size ? '#ffffff' : inputText,
                      border: `1px solid ${selectedSize === size ? accentColor : borderClr}`,
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: txtColor }}>
                {localText(language, { ar: 'اللون', en: 'Color', fr: 'Couleur' })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: selectedColor === color ? accentColor : inputBg,
                      color: selectedColor === color ? '#ffffff' : inputText,
                      border: `1px solid ${selectedColor === color ? accentColor : borderClr}`,
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Form */}
          {!isOutOfStock ? (
            <div
              ref={orderFormRef}
              className="rounded-xl sm:rounded-2xl p-4 sm:p-6"
              style={{ backgroundColor: formBg, border: `1px solid ${borderClr}` }}
            >
              <h3 className="font-semibold mb-4 text-sm sm:text-base" style={{ color: txtColor }}>
                {localText(language, { ar: 'اطلب الآن', en: 'Order Now', fr: 'Commander maintenant' })}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-xl text-sm" style={{ border: `1px solid rgba(239,68,68,0.2)` }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'الكمية', en: 'Quantity', fr: 'Quantite' })}
                  </label>
                  <div className="flex items-center rounded-xl w-fit" style={{ border: `1px solid ${borderClr}`, backgroundColor: inputBg }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-l-xl"
                      style={{ color: textMuted }}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium text-sm sm:text-base" style={{ color: txtColor }}>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-r-xl"
                      style={{ color: textMuted }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'الاسم الكامل *', en: 'Full Name *', fr: 'Nom complet *' })}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-current/20"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderClr}`, color: inputText }}
                    placeholder={localText(language, { ar: 'اسمك الكامل', en: 'Your full name', fr: 'Votre nom complet' })}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'رقم الهاتف *', en: 'Phone Number *', fr: 'Numero de telephone *' })}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-current/20"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderClr}`, color: inputText }}
                    placeholder="05XX XXX XXX"
                    required
                    dir="ltr"
                  />
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'الولاية *', en: 'Wilaya *', fr: 'Wilaya *' })}
                  </label>
                  <WilayaSelect
                    value={wilaya}
                    onChange={(v) => { setWilaya(v); setCommune(''); }}
                    backgroundColor={inputBg}
                    borderColor={borderClr}
                    textColor={inputText}
                  />
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'نوع التوصيل *', en: 'Delivery Type *', fr: 'Type de livraison *' })}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setDeliveryType('office'); setCommune(''); }}
                      className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300"
                      style={{
                        backgroundColor: deliveryType === 'office' ? accentColor : inputBg,
                        color: deliveryType === 'office' ? '#ffffff' : inputText,
                        border: `1px solid ${deliveryType === 'office' ? accentColor : borderClr}`,
                      }}
                    >
                      {localText(language, { ar: 'مكتب (ستوب ديسك)', en: 'Office (Stop Desk)', fr: 'Bureau (Stop Desk)' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('home')}
                      className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300"
                      style={{
                        backgroundColor: deliveryType === 'home' ? accentColor : inputBg,
                        color: deliveryType === 'home' ? '#ffffff' : inputText,
                        border: `1px solid ${deliveryType === 'home' ? accentColor : borderClr}`,
                      }}
                    >
                      {localText(language, { ar: 'المنزل', en: 'Home', fr: 'Domicile' })}
                    </button>
                  </div>
                </div>

                {/* Commune */}
                {wilaya && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                      {localText(language, { ar: 'البلدية', en: 'Commune', fr: 'Commune' })}
                    </label>
                    <CommuneSelect
                      wilayaName={wilaya}
                      value={commune}
                      onChange={setCommune}
                      backgroundColor={inputBg}
                      borderColor={borderClr}
                      textColor={inputText}
                    />
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: textMuted }}>
                    {localText(language, { ar: 'عنوان التوصيل *', en: 'Delivery Address *', fr: 'Adresse de livraison *' })}
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-current/20"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderClr}`, color: inputText }}
                    placeholder={localText(language, { ar: 'الشارع، المبنى، الشقة...', en: 'Street, building, apartment...', fr: 'Rue, batiment, appartement...' })}
                    rows={2}
                    required
                  />
                </div>

                {/* Total & Submit */}
                <div className="pt-3 sm:pt-4" style={{ borderTop: `1px solid ${borderClr}` }}>
                  {/* Subtotal */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm" style={{ color: textMuted }}>
                      {localText(language, { ar: 'المجموع الفرعي', en: 'Subtotal', fr: 'Sous-total' })}
                    </span>
                    <span className="text-sm sm:text-base font-medium" style={{ color: txtColor }}>
                      {totalPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
                    </span>
                  </div>
                  {/* Delivery Fee */}
                  {wilaya && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm" style={{ color: textMuted }}>
                        {localText(language, { ar: 'رسوم التوصيل', en: 'Delivery Fee', fr: 'Frais de livraison' })}
                      </span>
                      <span className="text-sm sm:text-base font-medium" style={{ color: txtColor }}>
                        {loadingFee ? '...' : deliveryFee !== null ? `${deliveryFee.toLocaleString()} ${localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}` : '-'}
                      </span>
                    </div>
                  )}
                  {/* Grand Total */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-sm sm:text-base" style={{ color: textMuted }}>
                      {localText(language, { ar: 'المجموع الكلي', en: 'Total', fr: 'Total' })}
                    </span>
                    <span className="text-lg sm:text-xl font-bold" style={{ color: accentColor }}>
                      {(totalPrice + (deliveryFee || 0)).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: textMuted }}>
                    {localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on delivery (COD)', fr: 'Paiement a la livraison' })}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 sm:py-4 text-white font-semibold rounded-xl text-sm sm:text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                  >
                    {submitting
                      ? localText(language, { ar: 'جاري الإرسال...', en: 'Placing Order...', fr: 'Commande en cours...' })
                      : localText(language, { ar: 'اشتري الآن', en: 'Buy Now', fr: 'Acheter maintenant' })}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-xl sm:rounded-2xl p-6 text-center" style={{ backgroundColor: formBg, border: `1px solid ${borderClr}` }}>
              <p className="mb-4 text-sm sm:text-base" style={{ color: textMuted }}>
                {localText(language, { ar: 'هذا المنتج غير متوفر حالياً', en: 'This product is currently out of stock.', fr: 'Ce produit est actuellement en rupture de stock.' })}
              </p>
              <Link
                href={`/${slug}`}
                className="inline-block px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 text-sm sm:text-base"
                style={{ backgroundColor: accentColor }}
              >
                {localText(language, { ar: 'تصفح منتجات أخرى', en: 'Browse Other Products', fr: "Voir d'autres produits" })}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 sm:pt-12 px-4 sm:px-0" style={{ borderTop: `1px solid ${borderClr}` }}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: txtColor }}>
            {localText(language, { ar: 'منتجات مشابهة', en: 'You may also like', fr: 'Vous aimerez aussi' })}
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
                  <div className="rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ backgroundColor: cardBg, border: `1px solid ${borderClr}` }}>
                    <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: formBg }}>
                      {relatedImage ? (
                        <Image
                          src={getR2PublicUrl(relatedImage)}
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
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
                          {localText(language, { ar: 'تخفيض', en: 'Sale', fr: 'Promo' })}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h3 className="font-medium text-xs sm:text-sm truncate" style={{ color: txtColor }}>{relatedProduct.name}</h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: accentColor }}>
                          {relatedDisplayPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
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
                {displayPrice.toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
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
                  selectedSize: selectedSize || undefined,
                  selectedColor: selectedColor || undefined,
                });
              }}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-80"
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
              }}
            >
              {getItemQuantity(product._id) > 0
                ? localText(language, { ar: `في السلة (${getItemQuantity(product._id)})`, en: `In Cart (${getItemQuantity(product._id)})`, fr: `Dans le panier (${getItemQuantity(product._id)})` })
                : localText(language, { ar: 'أضف للسلة', en: 'Add to Cart', fr: 'Ajouter au panier' })}
            </button>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
