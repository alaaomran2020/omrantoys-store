import React, { useMemo } from 'react';
import { MoonStar, Gift, Clock, Sparkles, BellRing } from 'lucide-react';
import { comingSoonCategories } from '../../data/categories';

const iconMap = { MoonStar, Gift, Sparkles };

export default function ComingSoonSection() {
  const items = useMemo(() => comingSoonCategories, []);

  if (!items.length) return null;

  return (
    <section id="coming-soon" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl overflow-hidden border border-amber-200 bg-gradient-to-br from-toy-navy via-[#1a2148] to-[#2a1a4d] p-6 sm:p-8 shadow-soft-lg">
        {/* زخارف خلفية */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-toy-yellow/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-8 w-48 h-48 rounded-full bg-toy-red/10 blur-2xl pointer-events-none" />

        {/* العنوان */}
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 text-center sm:text-right">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-toy-yellow/15 text-toy-yellow text-[11px] font-black px-3 py-1 rounded-full border border-toy-yellow/30">
              <Clock className="w-3 h-3" />
              قريباً على المتجر
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              استعد للمواسم القادمة 🌙
            </h2>
          </div>
          <p className="text-slate-300 text-sm max-w-md">
            بنحضّرلك تشكيلات موسمية مميزة. تابعنا عشان تكون أول من يعرف عند التوفر.
          </p>
        </div>

        {/* البطاقات */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <div
                key={cat.id}
                className="relative bg-white/5 backdrop-blur-sm border border-dashed border-white/20 rounded-2xl p-5 flex items-start gap-4 hover:border-toy-yellow/40 transition-colors"
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-pop`}>
                  <Icon className="w-7 h-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">{cat.name}</h3>
                    <span className="inline-flex items-center gap-1 bg-toy-yellow text-toy-navy text-[9px] font-black px-2 py-0.5 rounded-full">
                      <BellRing className="w-2.5 h-2.5" />
                      {cat.badge || 'قريباً'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                    {cat.description}
                  </p>
                  <span className="inline-block mt-3 text-[11px] font-bold text-toy-yellow/80">
                    ترقبوا التشكيلة قريباً بإذن الله
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
