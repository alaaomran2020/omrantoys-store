import React, { useState } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw, 
  Check, 
  Sparkles,
  Search,
  PackageOpen,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categories, ageGroups } from '../../data/categories';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const {
    products,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedAgeGroup,
    setSelectedAgeGroup,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    inStockOnly,
    setInStockOnly,
    onSaleOnly,
    setOnSaleOnly,
    setSearchQuery,
    formatPrice
  } = useStore();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Apply filters
  const filteredProducts = products.filter((product) => {
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchBrand = product.brand && product.brand.toLowerCase().includes(q);
      const matchTags = product.tags && product.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchBrand && !matchTags) return false;
    }

    // Category
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    // Age Group
    if (selectedAgeGroup !== 'all' && product.ageGroup !== selectedAgeGroup) {
      return false;
    }

    // Price
    if (product.price > priceRange) {
      return false;
    }

    // In Stock
    if (inStockOnly && product.stock <= 0) {
      return false;
    }

    // On Sale
    if (onSaleOnly && (!product.discountPercent || product.discountPercent <= 0)) {
      return false;
    }

    return true;
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'best-seller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0; // featured default
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedAgeGroup('all');
    setPriceRange(2500);
    setSearchQuery('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedAgeGroup !== 'all' ||
    priceRange < 2500 ||
    inStockOnly ||
    onSaleOnly ||
    searchQuery !== '';

  const activeFilterChips = [
    searchQuery.trim() && {
      id: 'search',
      label: `بحث: ${searchQuery.trim()}`,
      clear: () => setSearchQuery('')
    },
    selectedCategory !== 'all' && {
      id: 'category',
      label: categories.find((cat) => cat.id === selectedCategory)?.name || selectedCategory,
      clear: () => setSelectedCategory('all')
    },
    selectedAgeGroup !== 'all' && {
      id: 'age',
      label: ageGroups.find((age) => age.id === selectedAgeGroup)?.label || selectedAgeGroup,
      clear: () => setSelectedAgeGroup('all')
    },
    priceRange < 2500 && {
      id: 'price',
      label: `حتى ${formatPrice(priceRange)}`,
      clear: () => setPriceRange(2500)
    },
    inStockOnly && {
      id: 'stock',
      label: 'متوفر فقط',
      clear: () => setInStockOnly(false)
    },
    onSaleOnly && {
      id: 'sale',
      label: 'عروض فقط',
      clear: () => setOnSaleOnly(false)
    }
  ].filter(Boolean);

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900">
              تصفح كتالوج الألعاب بالجنيه المصري 🇪🇬
            </h2>
            <span className="bg-toy-red/10 text-toy-red font-black text-xs px-2.5 py-1 rounded-full">
              {sortedProducts.length} لعبة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ألعاب ممتعة وتعليمية مختارة بأعلى معايير الجودة والسلامة • الأسعار بالجنيه المصري (ج.م)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>تصفية ({hasActiveFilters ? 'مفعّلة' : 'الكل'})</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-slate-900"
            >
              <option value="featured">المقترح والمميز</option>
              <option value="best-seller">الأكثر مبيعاً</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="newest">وصل حديثاً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-3" aria-label="الفلاتر النشطة">
          <span className="text-xs font-bold text-slate-400">الفلاتر النشطة:</span>
          {activeFilterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-toy-red/20 bg-toy-red/5 px-3 py-1.5 text-xs font-bold text-toy-red transition-colors hover:bg-toy-red hover:text-white cursor-pointer"
              aria-label={`إزالة فلتر ${chip.label}`}
            >
              <span>{chip.label}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* Age Groups Quick Pills */}
      <div className="py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 shrink-0">الفئة العمرية:</span>
        {ageGroups.map((age) => {
          const isSelected = selectedAgeGroup === age.id;
          return (
            <button
              key={age.id}
              onClick={() => setSelectedAgeGroup(age.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-toy-red text-white shadow-sm scale-105'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span>{age.icon}</span>
              <span>{age.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-toy-red" />
              <span>تصفية المنتجات</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-toy-red hover:underline font-bold"
              >
                مسح الفلاتر
              </button>
            )}
          </div>

          {/* Categories List */}
          <div>
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2.5">
              الأقسام
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] ${selectedCategory === cat.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider in EGP */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                أقصى سعر (ج.م)
              </h4>
              <span className="font-black text-xs text-toy-red">
                {formatPrice(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="2500"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-toy-red"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>{formatPrice(200)}</span>
              <span>{formatPrice(2500)}</span>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-700">
              <span>المنتجات المتوفرة فقط</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-toy-red focus:ring-toy-red cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-700">
              <span>عروض التخفيضات فقط 🔥</span>
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-toy-red focus:ring-toy-red cursor-pointer"
              />
            </label>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center my-8">
              <div className="w-16 h-16 bg-rose-50 text-toy-red rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">
                لا توجد ألعاب مطابقة لهذه الخيارات
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                جرب تعديل خيارات التصفية أو البحث عن لعبة أخرى لاكتشاف المزيد من الخيارات الرائعة
              </p>
              <button
                onClick={resetFilters}
                className="bg-slate-900 hover:bg-toy-red text-white text-xs font-black px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                إعادة ضبط كل الفلاتر
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-toy-red" />
                  <span>تصفية الألعاب</span>
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter */}
              <div className="mt-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  الأقسام
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold ${
                        selectedCategory === c.id ? 'bg-toy-red text-white' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>أقصى سعر:</span>
                  <span className="text-toy-red">{formatPrice(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-toy-red"
                />
              </div>

              {/* In Stock & Sale */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>المتوفر فقط</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-toy-red"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>التخفيضات فقط 🔥</span>
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="rounded text-toy-red"
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                عرض النتائج ({sortedProducts.length})
              </button>
              <button
                onClick={resetFilters}
                className="bg-slate-100 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
