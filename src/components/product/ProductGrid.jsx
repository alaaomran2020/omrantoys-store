import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  PackageOpen,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from './ProductCard';
import AdvancedFilters from './AdvancedFilters';

export default function ProductGrid() {
  const {
    products,
    filteredProducts,
    advancedFilters,
    setAdvancedFilters,
    sortBy,
    setSortBy,
    formatPrice,
    getEffectivePrice
  } = useStore();

  const auth = useAuth();

  // Apply sorting to filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const getPrice = (p) => getEffectivePrice(p, auth);
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => getPrice(a) - getPrice(b));
      case 'price-high':
        return sorted.sort((a, b) => getPrice(b) - getPrice(a));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'best-seller':
        return sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      case 'newest':
        return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'stock':
        return sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      default:
        return sorted.sort((a, b) => {
          // Featured first, then best seller, then new
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
    }
  }, [filteredProducts, sortBy, auth]);

  const resetFilters = () => {
    setAdvancedFilters({
      search: '',
      category: 'all',
      ageGroup: 'all',
      toyType: 'all',
      brand: 'all',
      availability: 'all',
      priceMin: 0,
      priceMax: 2500,
      rating: 0,
    });
    setSortBy('featured');
  };

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              كتالوج الألعاب
              {auth.isMerchant && (
                <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-black">أسعار جملة</span>
              )}
            </h2>
            <span className="bg-toy-red/10 text-toy-red font-black text-xs px-2.5 py-1 rounded-full">
              {sortedProducts.length} من {products.length} لعبة
            </span>
            {auth.isMerchant && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
                خصم {auth.discountRate}% للجملة
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {auth.isMerchant 
              ? `مرحباً ${auth.profile?.business_name || 'تاجرنا'} - الأسعار الظاهرة هي أسعار الجملة الخاصة بك • شحن مجاني فوق 800 ج.م`
              : 'ألعاب ممتعة وتعليمية مختارة بأعلى معايير الجودة والسلامة • الأسعار بالجنيه المصري (ج.م)'}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>ترتيب حسب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-bold focus:outline-none cursor-pointer text-slate-900"
          >
            <option value="featured">المميز والمقترح</option>
            <option value="best-seller">الأكثر مبيعاً</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="rating">الأعلى تقييماً</option>
            <option value="newest">وصل حديثاً</option>
            <option value="stock">الأكثر توفراً</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        
        {/* Desktop Filters Sidebar - Advanced */}
        <aside className="hidden lg:block lg:col-span-1">
          <AdvancedFilters
            products={products}
            filters={advancedFilters}
            setFilters={setAdvancedFilters}
            onReset={resetFilters}
            resultsCount={sortedProducts.length}
            isMerchant={auth.isMerchant}
          />
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-6">
            <AdvancedFilters
              products={products}
              filters={advancedFilters}
              setFilters={setAdvancedFilters}
              onReset={resetFilters}
              resultsCount={sortedProducts.length}
              isMerchant={auth.isMerchant}
            />
          </div>

          {sortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Bulk info for wholesale */}
              {auth.isMerchant && sortedProducts.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                  <h4 className="font-black text-sm text-emerald-900">💼 نصائح للطلب الجملة</h4>
                  <ul className="mt-3 space-y-2 text-xs text-emerald-800">
                    <li>• اطلب 10 قطع فأكثر للحصول على خصم إضافي تلقائي</li>
                    <li>• الشحن مجاني للطلبات فوق 800 ج.م (بدلاً من 1000)</li>
                    <li>• استخدم زر إعادة الطلب السريع في لوحة تحكم التاجر للمنتجات التي نفدت</li>
                    <li>• تواصل عبر واتساب 01555570269 للطلبات الكبيرة فوق 10,000 ج.م</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center my-8">
              <div className="w-16 h-16 bg-rose-50 text-toy-red rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">لا توجد ألعاب مطابقة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">جرب تعديل الفلاتر أو البحث بكلمات مختلفة. لدينا {products.length} لعبة في الكتالوج.</p>
              <button onClick={resetFilters} className="bg-slate-900 hover:bg-toy-red text-white text-xs font-black px-6 py-2.5 rounded-xl transition-colors cursor-pointer">
                إعادة ضبط كل الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
