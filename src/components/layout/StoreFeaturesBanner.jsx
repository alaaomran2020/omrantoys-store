import React from 'react';
import { CreditCard, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function StoreFeaturesBanner() {
  const features = [
    {
      icon: CreditCard,
      title: 'دفع آمن ووسائل متعددة',
      desc: 'إنستاباي ومحافظ موبايل وبطاقات بنكية أو الدفع عند الاستلام نقداً للمندوب',
      color: 'bg-rose-50 text-toy-red border-rose-100',
      iconBg: 'bg-rose-500 text-white'
    },
    {
      icon: ShieldCheck,
      title: 'ألعاب آمنة ومطابقة 100%',
      desc: 'خامات عالية الجودة خالية من المواد الضارة ومناسبة لمختلف الأعمار',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-500 text-white'
    },
    {
      icon: Truck,
      title: 'شحن سريع لكافة المحافظات',
      desc: 'توصيل خلال 24 - 48 ساعة لكافة محافظات مصر وباب لباب',
      color: 'bg-blue-50 text-toy-blue border-blue-100',
      iconBg: 'bg-toy-blue text-white'
    },
    {
      icon: RotateCcw,
      title: 'استرجاع واستبدال مرن',
      desc: 'إمكانية المعاينة عند الاستلام واستبدال واسترجاع خلال 14 يوماً بكل سهولة',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-500 text-white'
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, index) => {
          const Icon = f.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border ${f.color} flex items-start gap-3.5 transition-transform hover:-translate-y-1`}
            >
              <div className={`p-2.5 rounded-xl ${f.iconBg} shadow-sm shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{f.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
