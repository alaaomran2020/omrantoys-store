import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Bell, PackageX } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import StockNotification from './StockNotification';

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductModal,
    formatPrice,
    getEffectivePrice
  } = useStore();

  const isFavorite = isInWishlist(product.id);
  const [showNotify, setShowNotify] = useState(false);

  const effectivePrice = getEffectivePrice(product);
  const originalPrice = product.originalPrice || product.retail_price || product.price;
  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock = (product.stock || 0) > 0 && (product.stock || 0) <= 5;

  return (
    <div className="bg-white rounded-blob border border-slate-100/90 shadow-soft hover:shadow-soft-lg hover:border-toy-red/20 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
      
      {/* Top Media Area */}
      <div className="relative bg-toy-cream overflow-hidden aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {isOutOfStock && (
            <span className="bg-slate-900 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
              <PackageX className="w-3 h-3" />
              نفد المخزون
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
              كمية محدودة ({product.stock})
            </span>
          )}
          {product.discountPercent > 0 && !isOutOfStock && (
            <span className="bg-toy-red text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              خصم {product.discountPercent}%
            </span>
          )}
          {product.isBestSeller && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              الأكثر طلباً 🔥
            </span>
          )}
          {product.isNew && !product.isBestSeller && !isOutOfStock && (
            <span className="bg-toy-green text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              وصل حديثاً ✨
            </span>
          )}
        </div>

        {/* Age Chip */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/65 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
          🎯 {product.ageGroup} سنوات
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isFavorite ? 'bg-rose-500 text-white scale-110' : 'bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProductModal(product)}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-toy-blue backdrop-blur-md transition-all shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
            title="معاينة سريعة"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">
              غير متوفر حالياً
            </div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              {product.brand}
              {product.is_balloon && <span className="bg-sky-100 text-sky-700 text-[9px] px-1.5 py-0.5 rounded-full">🎈 بالون</span>}
              {product.is_party_supply && !product.is_balloon && <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded-full">🎉 حفلات</span>}
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProductModal(product)}
            className="font-bold text-sm text-slate-900 hover:text-toy-red cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>

          {/* Wholesale tier info */}
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {formatPrice(effectivePrice)}
            </span>
            {originalPrice && originalPrice > effectivePrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <>
              {!showNotify ? (
                <button
                  onClick={() => setShowNotify(true)}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 font-bold py-3 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>أعلمني عند التوفر</span>
                </button>
              ) : (
                <StockNotification product={product} onClose={() => setShowNotify(false)} />
              )}
            </>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-slate-100 hover:bg-toy-red text-slate-800 hover:text-white font-bold py-3 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group/btn active:scale-95 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span>أضف للسلة</span>
            </button>
          )}

          {/* Stock indicator */}
          {!isOutOfStock && (
            <div className="mt-2 text-[10px] text-slate-400 text-center">
              {isLowStock ? (
                <span className="text-amber-600 font-bold">⚠️ متبقي {product.stock} فقط</span>
              ) : (
                <span>✓ متوفر - جاهز للشحن</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
