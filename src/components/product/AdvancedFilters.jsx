import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Star,
  Package,
  Tag,
  Baby,
  Gift,
  Sparkles,
  Check
} from 'lucide-react';
import { categories, ageGroups } from '../../data/categories';

const toyTypes = [
  { id: 'all', label: 'كل الأنواع', icon: '🧸' },
  { id: 'educational', label: 'تعليمية STEM', icon: '🧠' },
  { id: 'rc', label: 'تحكم عن بعد', icon: '🎮' },
  { id: 'doll', label: 'دمى وشخصيات', icon: '👸' },
  { id: 'building', label: 'تركيب وبناء', icon: '🧱' },
  { id: 'balloon', label: 'بالونات', icon: '🎈' },
  { id: 'party', label: 'مستلزمات حفلات', icon: '🎉' },
  { id: 'outdoor', label: 'خارجية وحركية', icon: '🚲' },
  { id: 'board', label: 'لوحية وعائلية', icon: '🎲' },
  { id: 'art', label: 'فنون وصلصال', icon: '🎨' },
];

const availabilityOptions = [
  { id: 'all', label: 'الكل' },
  { id: 'in_stock', label: 'متوفر فقط', count: null },
  { id: 'low_stock', label: 'كمية محدودة (≤5)', count: null },
  { id: 'out_of_stock', label: 'نفد المخزون', count: null },
  { id: 'on_sale', label: 'عروض وتخفيضات', count: null },
];

const brandOptions = ['Omran Toys', 'BuildMaster', 'TurboDrift', 'DreamHome', 'ArtKiddo', 'SpeedyKid', 'BabyCare', 'Little Scientist'];

export default function AdvancedFilters({ 
  products,
  filters,
  setFilters,
  onReset,
  resultsCount,
  isMerchant = false
}) {
  const [openSections, setOpenSections] = useState({
    search: true,
    category: true,
    age: true,
    price: true,
    toyType: true,
    availability: true,
    brand: false,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate counts for facets
  const facetCounts = useMemo(() => {
    const counts = {
      categories: {},
      ageGroups: {},
      toyTypes: {},
      brands: {},
      availability: { in_stock: 0, low_stock: 0, out_of_stock: 0, on_sale: 0 }
    };
    products.forEach(p => {
      counts.categories[p.category] = (counts.categories[p.category] || 0) + 1;
      counts.ageGroups[p.ageGroup] = (counts.ageGroups[p.ageGroup] || 0) + 1;
      if (p.brand) counts.brands[p.brand] = (counts.brands[p.brand] || 0) + 1;
      if (p.stock > 5) counts.availability.in_stock++;
      else if (p.stock > 0) counts.availability.low_stock++;
      else counts.availability.out_of_stock++;
      if (p.discountPercent > 0) counts.availability.on_sale++;
    });
    return counts;
  }, [products]);

  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.ageGroup !== 'all' ||
    filters.toyType !== 'all' ||
    filters.brand !== 'all' ||
    filters.availability !== 'all' ||
    filters.priceMax < 2500 ||
    filters.priceMin > 0 ||
    filters.search.trim() !== '' ||
    filters.rating > 0;

  const activeChips = [
    filters.search.trim() && { id: 'search', label: `بحث: ${filters.search.trim()}`, clear: () => setFilters(f => ({ ...f, search: '' })) },
    filters.category !== 'all' && { id: 'cat', label: categories.find(c => c.id === filters.category)?.name || filters.category, clear: () => setFilters(f => ({ ...f, category: 'all' })) },
    filters.ageGroup !== 'all' && { id: 'age', label: ageGroups.find(a => a.id === filters.ageGroup)?.label || filters.ageGroup, clear: () => setFilters(f => ({ ...f, ageGroup: 'all' })) },
    filters.toyType !== 'all' && { id: 'toy', label: toyTypes.find(t => t.id === filters.toyType)?.label || filters.toyType, clear: () => setFilters(f => ({ ...f, toyType: 'all' })) },
    filters.brand !== 'all' && { id: 'brand', label: filters.brand, clear: () => setFilters(f => ({ ...f, brand: 'all' })) },
    filters.availability !== 'all' && { id: 'avail', label: availabilityOptions.find(a => a.id === filters.availability)?.label || filters.availability, clear: () => setFilters(f => ({ ...f, availability: 'all' })) },
    (filters.priceMin > 0 || filters.priceMax < 2500) && { id: 'price', label: `${filters.priceMin}-${filters.priceMax} ج.م`, clear: () => setFilters(f => ({ ...f, priceMin: 0, priceMax: 2500 })) },
    filters.rating > 0 && { id: 'rating', label: `${filters.rating}★ فأكثر`, clear: () => setFilters(f => ({ ...f, rating: 0 })) },
  ].filter(Boolean);

  const FilterSection = ({ title, icon: Icon, sectionKey, children }) => (
    <div className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-2 text-sm font-black text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-toy-red" />}
          {title}
        </span>
        {openSections[sectionKey] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {openSections[sectionKey] && <div className="mt-3">{children}</div>}
    </div>
  );

  const filterContent = (
    <div className="space-y-5">
      {/* Search */}
      <FilterSection title="البحث المتقدم" icon={Search} sectionKey="search">
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="اسم اللعبة، العلامة، الوصف..."
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20 focus:border-toy-red"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="الفئة" icon={Tag} sectionKey="category">
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({ ...f, category: cat.id }))}
              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${filters.category === cat.id ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filters.category === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>{facetCounts.categories[cat.id] || 0}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Age Group */}
      <FilterSection title="الفئة العمرية" icon={Baby} sectionKey="age">
        <div className="grid grid-cols-1 gap-1.5">
          {ageGroups.map(age => (
            <button
              key={age.id}
              onClick={() => setFilters(f => ({ ...f, ageGroup: age.id }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${filters.ageGroup === age.id ? 'bg-toy-red text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
            >
              <span className="flex items-center gap-1.5"><span>{age.icon}</span><span>{age.label}</span></span>
              <span className="text-[10px] opacity-70">{facetCounts.ageGroups[age.id] || 0}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Toy Type */}
      <FilterSection title="نوع اللعبة" icon={Gift} sectionKey="toyType">
        <div className="grid grid-cols-2 gap-1.5">
          {toyTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilters(f => ({ ...f, toyType: type.id }))}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${filters.toyType === type.id ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'}`}
            >
              <span>{type.icon}</span>
              <span className="truncate">{type.label}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title={`السعر ${isMerchant ? '(جملة)' : '(قطاعي)'}`} icon={SlidersHorizontal} sectionKey="price">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="2500" value={filters.priceMin} onChange={(e) => setFilters(f => ({ ...f, priceMin: Number(e.target.value) }))} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="من" />
            <span className="text-slate-400">-</span>
            <input type="number" min="0" max="10000" value={filters.priceMax} onChange={(e) => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="إلى" />
          </div>
          <input type="range" min="0" max="2500" step="50" value={filters.priceMax} onChange={(e) => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))} className="w-full accent-toy-red h-2" />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>0 ج.م</span>
            <span className="text-toy-red font-black">{filters.priceMin} - {filters.priceMax} ج.م</span>
            <span>2500 ج.م</span>
          </div>
          {isMerchant && <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">💼 أسعار الجملة تظهر تلقائياً عند تسجيل دخول التاجر</div>}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="حالة التوفر" icon={Package} sectionKey="availability">
        <div className="space-y-1">
          {availabilityOptions.map(opt => (
            <label key={opt.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${filters.availability === opt.id ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'}`}>
              <span className="flex items-center gap-2">
                <input type="radio" name="availability" checked={filters.availability === opt.id} onChange={() => setFilters(f => ({ ...f, availability: opt.id }))} className="w-3.5 h-3.5 accent-toy-red" />
                {opt.label}
              </span>
              {opt.id !== 'all' && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">{facetCounts.availability[opt.id] || 0}</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="التقييم" icon={Star} sectionKey="brand">
        <div className="space-y-1.5">
          {[4, 3, 2, 0].map(r => (
            <button key={r} onClick={() => setFilters(f => ({ ...f, rating: r }))} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${filters.rating === r ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'hover:bg-slate-50 text-slate-700'}`}>
              {r > 0 ? (
                <>
                  <span className="flex">{Array.from({ length: r }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</span>
                  <span>{r} نجوم فأكثر</span>
                </>
              ) : <span>كل التقييمات</span>}
              {filters.rating === r && <Check className="w-3 h-3 ml-auto text-amber-600" />}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 mb-2">العلامة التجارية</h4>
          <div className="space-y-1">
            <button onClick={() => setFilters(f => ({ ...f, brand: 'all' }))} className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filters.brand === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>كل العلامات</button>
            {brandOptions.map(b => (
              <button key={b} onClick={() => setFilters(f => ({ ...f, brand: b }))} className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold flex justify-between cursor-pointer ${filters.brand === b ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                <span>{b}</span>
                <span className="text-[10px] opacity-60">{facetCounts.brands[b] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Active Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> الفلاتر النشطة:</span>
          {activeChips.map(chip => (
            <button key={chip.id} onClick={chip.clear} className="inline-flex items-center gap-1.5 rounded-full border border-toy-red/20 bg-toy-red/5 px-3 py-1.5 text-xs font-bold text-toy-red hover:bg-toy-red hover:text-white transition-colors cursor-pointer">
              <span>{chip.label}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
          <button onClick={onReset} className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">مسح الكل</button>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-toy-red" /> تصفية متقدمة</h3>
          <span className="bg-toy-red/10 text-toy-red font-black text-xs px-2.5 py-1 rounded-full">{resultsCount} نتيجة</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && <button onClick={onReset} className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl cursor-pointer">إعادة ضبط</button>}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"><Filter className="w-3.5 h-3.5" /> فلترة</button>
        </div>
      </div>

      {/* Desktop Sidebar - Rendered by parent via children? But we provide standalone */}
      <div className="hidden lg:block bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-28">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> الفلاتر الذكية</h3>
          {hasActiveFilters && <button onClick={onReset} className="text-[11px] text-toy-red hover:underline font-bold cursor-pointer">مسح</button>}
        </div>
        {filterContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2"><Filter className="w-4 h-4 text-toy-red" /> الفلاتر المتقدمة</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterContent}</div>
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <button onClick={() => setMobileOpen(false)} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">عرض {resultsCount} منتج</button>
              <button onClick={onReset} className="bg-slate-100 text-slate-700 font-bold px-4 py-3 rounded-xl text-sm cursor-pointer">مسح</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
