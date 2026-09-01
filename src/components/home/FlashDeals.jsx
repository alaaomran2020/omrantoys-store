import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function FlashDeals() {
  const { products, addToCart, setSelectedProductModal, formatPrice } = useStore();

  // 12 hours countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter 3 high-discount products
  const dealProducts = products
    .filter(p => p.discountPercent >= 20)
    .slice(0, 3);

  if (dealProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        
        {/* Header with timer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3 text-center md:text-right">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <Flame className="w-7 h-7 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                  صفقات اليوم الخارقة
                </span>
                <span className="text-xs text-white/90">خصم يصل إلى 30%</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                عروض الفلاش تنتهي قريباً ⏳
              </h3>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 text-center">
            <div className="flex flex-col bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[54px]">
              <span className="font-mono text-xl sm:text-2xl font-black text-yellow-300">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/75 font-medium">ساعة</span>
            </div>
            <span className="font-bold text-xl text-yellow-300">:</span>
            <div className="flex flex-col bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[54px]">
              <span className="font-mono text-xl sm:text-2xl font-black text-yellow-300">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/75 font-medium">دقيقة</span>
            </div>
            <span className="font-bold text-xl text-yellow-300">:</span>
            <div className="flex flex-col bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[54px]">
              <span className="font-mono text-xl sm:text-2xl font-black text-yellow-300">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/75 font-medium">ثانية</span>
            </div>
          </div>
        </div>

        {/* 3 Flash Deal Products */}
        <div className="mt-6 flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
          {dealProducts.map((product) => {
            const soldCount = Math.floor(product.stock * 1.8);
            const totalStock = product.stock + soldCount;
            const progressPercent = Math.min(95, Math.round((soldCount / totalStock) * 100));

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 text-slate-800 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group min-w-[78%] sm:min-w-[60%] md:min-w-0 snap-center shrink-0"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div 
                    onClick={() => setSelectedProductModal(product)}
                    className="relative h-44 rounded-xl overflow-hidden cursor-pointer bg-slate-100 mb-3"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow">
                      خصم {product.discountPercent}%
                    </div>
                  </div>

                  {/* Title & Brand */}
                  <h4 
                    onClick={() => setSelectedProductModal(product)}
                    className="font-bold text-sm text-slate-900 hover:text-toy-red cursor-pointer line-clamp-1 mb-1"
                  >
                    {product.name}
                  </h4>

                  {/* Stock Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>تم بيع: {soldCount} قطعة</span>
                      <span className="text-rose-600 font-bold">متبقي {product.stock} فقط!</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Add Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through block">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-base font-black text-rose-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-slate-900 hover:bg-toy-red text-white p-2.5 rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                    title="أضف للسلة"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>شراء</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
