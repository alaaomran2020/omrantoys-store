import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingCart, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const WHATSAPP_NUMBER = '201555570269';

export default function MobileBottomNav() {
  const {
    totalItemsCount, setIsCartOpen, setIsWishlistOpen,
    wishlist, setSearchQuery, setSelectedCategory
  } = useStore();

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goProducts = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const items = [
    { id: 'home', label: 'الرئيسية', icon: Home, onClick: goHome },
    { id: 'categories', label: 'الأقسام', icon: LayoutGrid, onClick: goProducts },
    { id: 'wishlist', label: 'المفضلة', icon: Heart, onClick: () => setIsWishlistOpen(true), badge: wishlist.length },
    { id: 'cart', label: 'السلة', icon: ShoppingCart, onClick: () => setIsCartOpen(true), badge: totalItemsCount, highlight: true },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-stretch">
          {items.map(({ id, label, icon: Icon, onClick, badge, highlight }) => (
            <button
              key={id}
              onClick={onClick}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 active:scale-95 transition-transform cursor-pointer ${highlight ? 'text-toy-red' : 'text-slate-600'}`}
            >
              <span className="relative">
                <Icon className={`w-5 h-5 ${highlight ? 'stroke-[2.4]' : ''}`} />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-1 bg-toy-red text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-emerald-600 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">واتساب</span>
          </a>
        </div>
      </nav>
    </>
  );
}
