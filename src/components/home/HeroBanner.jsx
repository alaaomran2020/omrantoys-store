import React from 'react';
import { Sparkles, Gift, ArrowLeft, ShieldCheck, Truck, Star, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function HeroBanner() {
  const { setIsGiftFinderOpen, setSelectedCategory, formatPrice } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white py-12 lg:py-20">
      {/* Decorative Glow Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-toy-red/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-toy-yellow/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-toy-purple/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left / Main Text (RTL: right side) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-toy-red/30 to-purple-500/30 border border-toy-red/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-yellow-300 shadow-sm animate-bounce-slow">
              <Sparkles className="w-4 h-4 text-toy-yellow" />
              <span>عروض التوفير الكبرى | خصومات حصرية حتى 40%</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
              عالم السحر والمرح <br />
              <span className="bg-gradient-to-l from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                لأبطال المستقبل الصغار!
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              اكتشف أكثر من 1000 لعبة تفاعلية، أطقم ليغو وبناء، روبوتات ذكية، وألعاب تعليمية معتمدة تنمي خيال وذكاء طفلك وتصنع أروع الذكريات.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#products-section"
                className="w-full sm:w-auto bg-gradient-to-r from-toy-red to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black px-7 py-3.5 rounded-2xl text-base shadow-lg shadow-toy-red/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <span>تسوق الآن واستكشف الألعاب</span>
                <ArrowLeft className="w-5 h-5" />
              </a>

              <button
                onClick={() => setIsGiftFinderOpen(true)}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-base backdrop-blur-md flex items-center justify-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
              >
                <Gift className="w-5 h-5 text-toy-yellow" />
                <span>مستكشف الهدايا الذكي</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 max-w-lg mx-auto lg:mx-0 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">توصيل سريع</span>
                <span className="text-[11px] text-slate-400">خلال 24-48 ساعة</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Gift className="w-5 h-5 text-toy-yellow" />
                <span className="text-xs font-bold text-slate-200">تغليف هدايا</span>
                <span className="text-[11px] text-slate-400">مجاناً لكل طلب</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">أمان 100%</span>
                <span className="text-[11px] text-slate-400">مطابقة لمواصفات SASO</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Card / Hero Visual */}
          <div className="lg:col-span-5 relative">
            
            {/* Background Shape */}
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-toy-red via-purple-600 to-toy-yellow rounded-3xl rotate-3 blur-sm opacity-60" />
              
              <div className="relative bg-slate-900/90 border border-white/15 backdrop-blur-xl rounded-3xl p-5 shadow-2xl overflow-hidden">
                {/* Hero Toy Image */}
                <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"
                    alt="روبوت كوزمو التفاعلي"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-toy-red text-white text-xs font-black px-3 py-1 rounded-full shadow">
                    الأكثر مبيعاً 🏆
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>4.9 (142 تقييم)</span>
                  </div>
                </div>

                {/* Hero Toy Info */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-toy-yellow font-bold uppercase tracking-wider">
                      أحدث التقنيات للأطفال
                    </span>
                    <h3 className="font-bold text-base text-white">
                      روبوت الذكاء الاصطناعي كوزمو
                    </h3>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-400 line-through">
                      {formatPrice(429)}
                    </div>
                    <div className="text-xl font-black text-white">
                      {formatPrice(349)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating micro badges */}
              <div className="absolute -top-3 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-2xl shadow-xl border-2 border-white flex items-center gap-1.5 animate-bounce-slow">
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>خصم 20% لفترة محدودة</span>
              </div>

              <div className="absolute -bottom-4 -left-3 bg-white text-slate-900 font-bold text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <span>تغليف إهداء مجاني جاهز</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
