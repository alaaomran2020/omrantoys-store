import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const demoSales = [
  { name: 'أم يوسف', city: 'طنطا', item: 'روبوت الذكاء الاصطناعي كوزمو', time: 'منذ دقيقة', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=150&q=80' },
  { name: 'أحمد حسني', city: 'القاهرة', item: 'طقم استكشاف الفضاء ومكوك ناسا', time: 'منذ 3 دقائق', img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=150&q=80' },
  { name: 'سارة إبراهيم', city: 'الإسكندرية', item: 'سكوتر الأطفال المضيء فائق الثبات', time: 'منذ 5 دقائق', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=150&q=80' },
  { name: 'محمود عبدالسلام', city: 'المنصورة', item: 'قلعة الفرسان السحرية المغناطيسية', time: 'منذ 7 دقائق', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=150&q=80' },
  { name: 'داليا رمزي', city: 'الجيزة', item: 'فيلا الأحلام الخشبية الفاخرة للدمى', time: 'منذ دقيقتين', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80' },
];

export default function LiveSalesNotification() {
  const [currentSale, setCurrentSale] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentSale(demoSales[index % demoSales.length]);
      setIsVisible(true);
      index++;

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !currentSale) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <img
        src={currentSale.img}
        alt="المنتج"
        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
      />
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="font-bold text-slate-800">{currentSale.name}</span>
          <span>من {currentSale.city}</span>
          <span className="text-[10px] text-emerald-600 font-bold mr-1">• {currentSale.time}</span>
        </div>
        <p className="font-black text-xs text-slate-900 truncate mt-0.5">
          اشترى: {currentSale.item}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-slate-300 hover:text-slate-500 p-1 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
