import React from 'react';
import { Heart, ShoppingCart, Eye, Star, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductModal,
    formatPrice
  } = useStore();

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Media Area */}
      <div className="relative bg-slate-50 overflow-hidden aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-toy-red text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              خصم {product.discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              الأكثر طلباً 🔥
            </span>
          )}
          {product.isNew && !product.isBestSeller && (
            <span className="bg-toy-green text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              وصل حديثاً ✨
            </span>
          )}
        </div>

        {/* Age Chip */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/65 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
          🎯 {product.ageGroup} سنوات
        </div>

        {/* Action Buttons (Wishlist & Quick View) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            aria-label="المفضلة"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProductModal(product)}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-toy-blue backdrop-blur-md transition-all shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
            title="معاينة سريعة"
            aria-label="معاينة سريعة"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-400">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700">{product.rating}</span>
              <span className="text-[11px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setSelectedProductModal(product)}
            className="font-bold text-sm text-slate-900 hover:text-toy-red cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-lg font-black text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="w-full bg-slate-100 hover:bg-toy-red text-slate-800 hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group/btn active:scale-95 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span>إضافة إلى السلة</span>
          </button>
        </div>
      </div>

    </div>
  );
}
