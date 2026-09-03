import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function WishlistModal() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    setSelectedProductModal,
    formatPrice
  } = useStore();

  if (!isWishlistOpen) return null;

  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    favoriteProducts.forEach(p => {
      addToCart(p);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                قائمة المفضلة والأمنيات ❤️
              </h2>
              <span className="text-xs text-slate-500">
                {favoriteProducts.length} ألعاب محفوظة
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 flex-1">
          {favoriteProducts.length > 0 ? (
            favoriteProducts.map((toy) => (
              <div key={toy.id} className="py-4 first:pt-0 flex items-center gap-3 sm:gap-4">
                <img
                  src={toy.images[0]}
                  alt={toy.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-50 border border-slate-100 shrink-0 cursor-pointer"
                  onClick={() => {
                    setSelectedProductModal(toy);
                    setIsWishlistOpen(false);
                  }}
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                    {toy.brand} • {toy.ageGroup} سنوات
                  </span>
                  <h4
                    onClick={() => {
                      setSelectedProductModal(toy);
                      setIsWishlistOpen(false);
                    }}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-toy-red cursor-pointer truncate"
                  >
                    {toy.name}
                  </h4>
                  <span className="font-black text-xs sm:text-sm text-toy-red mt-1 block">
                    {formatPrice(toy.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => addToCart(toy)}
                    className="bg-slate-900 hover:bg-toy-red text-white p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    title="نقل إلى السلة"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">أضف للسلة</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(toy.id)}
                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-14 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-1">
                قائمة أمنياتك فارغة حالياً
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                انقر على رمز القلب الموجود على أي لعبة لحفظها هنا ومتابعتها لاحقاً!
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="bg-slate-900 hover:bg-toy-red text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                استكشاف الألعاب
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {favoriteProducts.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleMoveAllToCart}
              className="bg-toy-red hover:bg-rose-600 text-white text-xs font-black px-5 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>إضافة جميع الألعاب المفضلة للسلة</span>
            </button>

            <button
              onClick={() => setIsWishlistOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              إغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
