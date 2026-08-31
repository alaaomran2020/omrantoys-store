import React, { useState } from 'react';
import { 
  X, 
  Gift, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  RotateCcw, 
  ShoppingCart, 
  Star 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function GiftFinderModal() {
  const {
    isGiftFinderOpen,
    setIsGiftFinderOpen,
    products,
    addToCart,
    setSelectedProductModal,
    formatPrice
  } = useStore();

  const [step, setStep] = useState(1);
  const [selectedAge, setSelectedAge] = useState('6-8');
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');

  if (!isGiftFinderOpen) return null;

  const ageOptions = [
    { id: '0-2', label: '0 - سنتين', sub: 'رضع ومواليد', emoji: '🍼' },
    { id: '3-5', label: '3 - 5 سنوات', sub: 'روضة وما قبل المدرسة', emoji: '🧸' },
    { id: '6-8', label: '6 - 8 سنوات', sub: 'مرحلة الاكتشاف والتعلم', emoji: '🚀' },
    { id: '9-12', label: '9 - 12 سنة', sub: 'شغف وتحدي وابتكار', emoji: '🎮' },
    { id: '12+', label: '12+ سنة', sub: 'مراهقين ويافعين', emoji: '🧩' },
  ];

  const interestOptions = [
    { id: 'all', label: 'كل الاهتمامات مرحب بها', emoji: '🌟' },
    { id: 'educational', label: 'علوم، ذكاء وتجارب STEM', emoji: '🔬' },
    { id: 'building', label: 'بناء، مكعبات وتشييد', emoji: '🧱' },
    { id: 'rc-electronic', label: 'سيارات تحكم، روبوتات وسرعة', emoji: '🏎️' },
    { id: 'arts-crafts', label: 'فنون، رسم وتلوين وصلصال', emoji: '🎨' },
    { id: 'outdoor', label: 'حركة، سكوتر وأنشطة خارجية', emoji: '🛴' },
  ];

  const budgetOptions = [
    { id: 'all', label: 'أي ميزانية مناسبة', range: 'الكل' },
    { id: 'low', label: 'أقل من 500 جنيه', range: '< 500 ج.م' },
    { id: 'mid', label: 'من 500 إلى 1,200 جنيه', range: '500 - 1,200 ج.م' },
    { id: 'high', label: 'أكثر من 1,200 جنيه (ألعاب فاخرة وكبيرة)', range: '> 1,200 ج.م' },
  ];

  // Recommendations calculation in Egyptian Pounds
  const recommendedToys = products.filter(p => {
    if (selectedAge && p.ageGroup !== selectedAge) {
      const ageNum = parseInt(selectedAge);
      const pAgeNum = parseInt(p.ageGroup);
      if (Math.abs(ageNum - pAgeNum) > 2) return false;
    }

    if (selectedInterest !== 'all' && p.category !== selectedInterest) {
      return false;
    }

    if (selectedBudget === 'low' && p.price >= 500) return false;
    if (selectedBudget === 'mid' && (p.price < 500 || p.price > 1200)) return false;
    if (selectedBudget === 'high' && p.price <= 1200) return false;

    return true;
  });

  const resetFinder = () => {
    setStep(1);
    setSelectedAge('6-8');
    setSelectedInterest('all');
    setSelectedBudget('all');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">مستكشف الهدايا الذكي للأطفال 🎁</h2>
              <span className="text-xs text-white/80">3 خطوات بسيطة للهدية المثالية بالجنيه المصري</span>
            </div>
          </div>

          <button
            onClick={() => setIsGiftFinderOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-100 text-center text-xs font-bold bg-slate-50">
          <div className={`p-2.5 ${step === 1 ? 'text-toy-red border-b-2 border-toy-red bg-white' : 'text-slate-400'}`}>
            1. عمر الطفل
          </div>
          <div className={`p-2.5 ${step === 2 ? 'text-toy-red border-b-2 border-toy-red bg-white' : 'text-slate-400'}`}>
            2. اهتماماته
          </div>
          <div className={`p-2.5 ${step === 3 ? 'text-toy-red border-b-2 border-toy-red bg-white' : 'text-slate-400'}`}>
            3. الميزانية
          </div>
          <div className={`p-2.5 ${step === 4 ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-slate-400'}`}>
            ✨ الترشيحات
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          
          {/* Step 1: Age */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-slate-900">كم عمر الطفل المحظوظ؟</h3>
                <p className="text-xs text-slate-500">اختر الفئة العمرية لعرض الألعاب المناسبة لمهاراته</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ageOptions.map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setSelectedAge(age.id)}
                    className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 cursor-pointer ${
                      selectedAge === age.id
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{age.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{age.label}</h4>
                      <span className="text-xs text-slate-500">{age.sub}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-toy-red hover:bg-rose-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <span>التالي: اختيار الاهتمام</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-slate-900">ما هو شغف الطفل واهتمامه المفضل؟</h3>
                <p className="text-xs text-slate-500">هل يحب التركيب، العلوم، الحركة، أم الفنون؟</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedInterest(item.id)}
                    className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 cursor-pointer ${
                      selectedInterest === item.id
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-800">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  رجوع
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-toy-red hover:bg-rose-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <span>التالي: تحديد الميزانية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-slate-900">ما هي الميزانية المناسبة لك؟</h3>
                <p className="text-xs text-slate-500">سنرشح لك أفضل الألعاب بالجنيه المصري في نطاق ميزانيتك</p>
              </div>

              <div className="space-y-2.5">
                {budgetOptions.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBudget(b.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                      selectedBudget === b.id
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-bold text-sm text-slate-800">{b.label}</span>
                    <span className="text-xs font-bold text-toy-red">{b.range}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  رجوع
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>عرض أفضل الهدايا المقترحة!</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results Showcase */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    أفضل الألعاب المرشحة ({recommendedToys.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    بناءً على العمر: {selectedAge} سنوات • بالجنيه المصري
                  </p>
                </div>
                <button
                  onClick={resetFinder}
                  className="flex items-center gap-1 text-xs font-bold text-toy-red hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة البحث</span>
                </button>
              </div>

              {recommendedToys.length > 0 ? (
                <div className="space-y-3">
                  {recommendedToys.map((toy) => (
                    <div
                      key={toy.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5 hover:bg-slate-100/70 transition-colors"
                    >
                      <img
                        src={toy.images[0]}
                        alt={toy.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer"
                        onClick={() => {
                          setSelectedProductModal(toy);
                          setIsGiftFinderOpen(false);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => {
                            setSelectedProductModal(toy);
                            setIsGiftFinderOpen(false);
                          }}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-toy-red cursor-pointer truncate"
                        >
                          {toy.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-black text-xs text-toy-red">
                            {formatPrice(toy.price)}
                          </span>
                          <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {toy.ageGroup} سنوات
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{toy.rating}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(toy, 1)}
                        className="bg-toy-red hover:bg-rose-600 text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-transform active:scale-95 shadow-sm"
                        title="إضافة كهدية مع تغليف"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">أضف كهدية</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-500 mb-4">
                    لم نجد لعبة تطابق جميع هذه الشروط بالتحديد. جرب توسيع خيارات الميزانية.
                  </p>
                  <button
                    onClick={resetFinder}
                    className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    إعادة البحث من جديد
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
