import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Heart, Sparkles, Package, Settings, Gift, Menu, X, 
  User, LogOut, Store, LayoutDashboard, ShieldCheck, Building
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data/categories';

export default function Header() {
  const {
    products, cart, wishlist, formatPrice, totalItemsCount, cartSubtotal,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    setIsCartOpen, setIsWishlistOpen, setIsGiftFinderOpen, setIsAdminOpen,
    setIsTrackingOpen, setSelectedProductModal, setIsAuthModalOpen,
    setIsMerchantDashboardOpen
  } = useStore();

  const { user, profile, isAuthenticated, isMerchant, isVerifiedMerchant, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  const liveSearchResults = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) setShowSearchResults(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-toy-red via-toy-purple to-toy-blue text-white text-xs sm:text-sm py-2 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold animate-pulse">عروض مصر 🇪🇬</span>
            <span className="truncate">
              {isMerchant ? `تاجر جملة - خصم ${profile?.discount_rate || 15}% تلقائي • شحن مجاني فوق 800 ج.م` : `شحن مجاني لكافة المحافظات فوق 1,000 ج.م | كود: OMRAN10`}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <button onClick={() => setIsGiftFinderOpen(true)} className="flex items-center gap-1 hover:text-yellow-200 transition-colors cursor-pointer"><Gift className="w-3.5 h-3.5" /><span>مستكشف الهدايا</span></button>
            <span className="opacity-40">|</span>
            <button onClick={() => setIsTrackingOpen(true)} className="flex items-center gap-1 hover:text-yellow-200 transition-colors cursor-pointer"><Package className="w-3.5 h-3.5" /><span>تتبع شحنتك</span></button>
            <span className="opacity-40">|</span>
            <a href="#b2b-blog" className="flex items-center gap-1 hover:text-yellow-200 transition-colors"><Building className="w-3.5 h-3.5" /><span>دليل التجار</span></a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"><Menu className="w-6 h-6" /></button>
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-100 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                <img src="/omran-brand-mark.png" alt="شعار عمران" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">عمران <span className="text-toy-red">للألعاب</span></span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wide flex items-center gap-1">
                  شركة عمران التجارية • لعب أطفال - هدايا
                  {isMerchant && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full text-[9px]">تاجر جملة</span>}
                </span>
              </div>
            </a>
          </div>

          {/* Search */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <div className="relative w-full">
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }} onFocus={() => setShowSearchResults(true)} placeholder="ابحث عن روبوت، مكعبات، بالونات، مستلزمات حفلات..." className="w-full pl-10 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-toy-red rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-toy-red/20 text-slate-800 placeholder-slate-400" />
              <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"><X className="w-4 h-4" /></button>}
            </div>
            {showSearchResults && liveSearchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500"><span>أفضل النتائج ({liveSearchResults.length})</span><span className="text-[11px] text-toy-blue">اضغط للعرض</span></div>
                <div className="divide-y divide-slate-50">
                  {liveSearchResults.map((item) => (
                    <div key={item.id} onClick={() => { setSelectedProductModal(item); setShowSearchResults(false); }} className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                      <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4><div className="flex items-center gap-2 mt-0.5"><span className="text-xs font-bold text-toy-red">{formatPrice(item.price)}</span><span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{item.ageGroup} سنوات</span></div></div>
                      <span className="text-xs text-toy-blue font-medium shrink-0">عرض ←</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl text-xs font-black text-emerald-800 shadow-sm"><span className="text-sm">🇪🇬</span><span>ج.م</span></div>

            {/* Auth / User */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isMerchant ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-white'}`}>
                  {isMerchant ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span className="hidden sm:inline max-w-[100px] truncate">{profile?.business_name || profile?.full_name || 'حسابي'}</span>
                  {isVerifiedMerchant && <ShieldCheck className="w-3 h-3 text-emerald-200" />}
                </button>

                {showUserMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <div className="font-black text-sm text-slate-900 truncate">{profile?.full_name}</div>
                      <div className="text-xs text-slate-500 truncate">{profile?.email}</div>
                      {isMerchant && <div className="mt-2 flex items-center gap-2"><span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded-full font-bold">{profile?.wholesale_tier === 'tier3' ? 'موزع رئيسي' : profile?.wholesale_tier === 'tier2' ? 'تاجر معتمد' : 'تاجر مبتدئ'}</span><span className="text-[11px] text-emerald-700 font-bold">{profile?.discount_rate}% خصم</span></div>}
                    </div>
                    <div className="p-2 space-y-1">
                      {isMerchant && <button onClick={() => { setIsMerchantDashboardOpen(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"><LayoutDashboard className="w-4 h-4" /> لوحة تحكم التاجر</button>}
                      <button onClick={() => { setIsTrackingOpen(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"><Package className="w-4 h-4" /> طلباتي</button>
                      <button onClick={() => { setIsWishlistOpen(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"><Heart className="w-4 h-4" /> المفضلة ({wishlist.length})</button>
                      <div className="border-t border-slate-100 my-1" />
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"><LogOut className="w-4 h-4" /> تسجيل خروج</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"><User className="w-4 h-4" /><span>دخول / حساب</span></button>
            )}

            <button onClick={() => setIsWishlistOpen(true)} className="relative p-2.5 text-slate-600 hover:text-toy-red hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Heart className="w-5 h-5" />{wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-toy-red text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm">{wishlist.length}</span>}</button>

            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2.5 bg-toy-red hover:bg-rose-600 text-white px-3.5 py-2 rounded-xl font-bold text-sm shadow-md shadow-toy-red/20 transition-all hover:scale-105 cursor-pointer">
              <div className="relative"><ShoppingCart className="w-5 h-5" />{totalItemsCount > 0 && <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-slate-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-toy-red shadow-sm">{totalItemsCount}</span>}</div>
              <div className="hidden sm:flex flex-col text-right leading-tight"><span className="text-[10px] font-normal text-rose-100">{isMerchant ? 'طلب جملة' : 'السلة'}</span><span className="text-xs font-black">{formatPrice(cartSubtotal)}</span></div>
            </button>

            <button onClick={() => setIsAdminOpen(true)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="لوحة الإدارة"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن ألعاب، بالونات، حفلات..." className="w-full pl-9 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20" />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white/95 backdrop-blur-sm shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 whitespace-nowrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100/70 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'}`}><span>{cat.name}</span>{cat.id !== 'all' && <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{cat.count}</span>}</button>;
          })}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100"><div className="flex items-center gap-2"><span className="text-2xl">🧸</span><span className="font-black text-lg text-slate-900">عمران للألعاب</span></div><button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-6 h-6" /></button></div>

              <div className="mt-4 space-y-3">
                {!isAuthenticated ? (
                  <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white font-bold text-sm"><User className="w-5 h-5" /> تسجيل دخول / إنشاء حساب</button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-sm text-slate-900">{profile?.full_name}</div>
                    <div className="text-xs text-slate-500">{profile?.email}</div>
                    {isMerchant && <div className="mt-2"><span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-1 rounded-full font-bold">تاجر جملة - {profile?.discount_rate}% خصم</span></div>}
                  </div>
                )}

                {isMerchant && <button onClick={() => { setIsMerchantDashboardOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-sm"><Store className="w-5 h-5 text-emerald-600" /> لوحة تحكم التاجر</button>}

                <button onClick={() => { setIsGiftFinderOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-900 font-bold text-sm"><Gift className="w-5 h-5 text-amber-600" /> مستكشف الهدايا الذكي</button>
                <button onClick={() => { setIsTrackingOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-900 font-bold text-sm"><Package className="w-5 h-5 text-blue-600" /> تتبع الشحنة</button>
                <button onClick={() => { setIsAdminOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm"><Settings className="w-5 h-5 text-slate-600" /> لوحة الإدارة</button>
                {isAuthenticated && <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm"><LogOut className="w-5 h-5" /> تسجيل خروج</button>}
              </div>

              <div className="mt-6"><h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">تصفح الأقسام</h5><div className="space-y-1">{categories.map(cat => <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }} className={`w-full text-right px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${selectedCategory === cat.id ? 'bg-toy-red text-white' : 'hover:bg-slate-50 text-slate-700'}`}><span>{cat.name}</span><span className="text-xs opacity-75">{cat.count} لعبة</span></button>)}</div></div>
            </div>
            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400"><p>متجر عمران للألعاب © 2026 - مصر 🇪🇬</p><p className="mt-1">جميع الأسعار بالجنيه المصري</p></div>
          </div>
        </div>
      )}
    </header>
  );
}
