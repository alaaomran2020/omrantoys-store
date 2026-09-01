import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  Boxes, 
  Cpu, 
  HeartHandshake, 
  Dices, 
  Bike, 
  Baby, 
  Palette,
  MoonStar,
  Gift,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categories } from '../../data/categories';
import { track, EVENTS } from '../../lib/analytics';

const iconMap = {
  Sparkles,
  Brain,
  Boxes,
  Cpu,
  HeartHandshake,
  Dices,
  Bike,
  Baby,
  Palette,
  MoonStar,
  Gift
};

export default function CategoryShowcase() {
  const { selectedCategory, setSelectedCategory, products } = useStore();

  // عدد المنتجات الفعلي لكل قسم (بدل الأرقام الثابتة)
  const countByCategory = useMemo(() => {
    const counts = {};
    for (const p of products || []) {
      if (p?.is_visible === false) continue;
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // الأقسام المتاحة: التي بها منتجات فعلياً
  const visibleCategories = useMemo(
    () => categories.slice(1).filter((c) => !c.comingSoon && (countByCategory[c.id] || 0) > 0),
    [countByCategory]
  );

  // الأقسام القادمة قريباً (تُعرض دائماً كبطاقات تشويقية غير قابلة للضغط)
  const comingSoonCategories = useMemo(
    () => categories.filter((c) => c.comingSoon),
    []
  );

  const handleSelect = (id) => {
    setSelectedCategory(id);
    track(EVENTS.categoryView, { category: id });
    const elem = document.getElementById('products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-toy-red font-bold text-xs uppercase tracking-wider">
            اكتشف حسب الفئة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            أقسام الألعاب الأكثر طلباً 🎨
          </h2>
        </div>
        <p className="text-slate-500 text-sm max-w-md">
          تشكيلات مدروسة تلبي جميع اهتمامات أطفالك من الرضاعة وحتى عمر المراهقة
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {visibleCategories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Sparkles;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 group cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-br from-toy-red to-pink-600 text-white shadow-soft-lg scale-105 border-transparent'
                  : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-toy-red/30 shadow-soft hover:shadow-soft-lg'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-3 shadow-pop group-hover:scale-110 group-hover:-rotate-3 transition-transform`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {cat.name}
              </span>
              <span className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {countByCategory[cat.id] || 0} لعبة
              </span>
            </button>
          );
        })}

        {/* أقسام قريباً */}
        {comingSoonCategories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Sparkles;

          return (
            <div
              key={cat.id}
              title={cat.description}
              aria-disabled="true"
              className="relative p-4 rounded-2xl flex flex-col items-center text-center border border-dashed border-amber-300 bg-amber-50/60 cursor-not-allowed overflow-hidden select-none"
            >
              {/* شارة قريباً */}
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-toy-navy text-toy-yellow text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                <Clock className="w-2.5 h-2.5" />
                {cat.badge || 'قريباً'}
              </span>

              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-3 shadow-pop opacity-70`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-2 text-slate-700">
                {cat.name}
              </span>
              <span className="text-[10px] mt-1 font-bold text-amber-600">
                قريباً بإذن الله
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
