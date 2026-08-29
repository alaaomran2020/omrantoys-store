import React from 'react';
import { Star, Quote, Heart } from 'lucide-react';

const testimonials = [
  {
    name: 'أم عبدالملك - الرياض',
    role: 'والدة طفلين (4 و 7 سنوات)',
    rating: 5,
    text: 'متجر عمران صار وجهتنا الأساسية في كل مناسبة وعيد ميلاد! الروبوت الذكي وطقم استكشاف الفضاء أخذوا عقل أولادي، والأحلى من كذا التغليف الهدية يبيض الوجه وسرعة التوصيل خيالية.',
    toy: 'روبوت الذكاء الاصطناعي كوزمو'
  },
  {
    name: 'المهندس ريان الغامدي - جدة',
    role: 'أب لطفلة (5 سنوات)',
    rating: 5,
    text: 'بيت الدمى الخشبي الفاخر فاق توقعاتي في المتانة ونظافة الخشب والدهانات الآمنة. بنتي مستانسة عليه بشكل لا يوصف، والخدمة وتعامل الدعم راقي جداً.',
    toy: 'فيلا الأحلام الخشبية الفاخرة للدمى'
  },
  {
    name: 'سارة العبداللطيف - الخبر',
    role: 'معلمة رياض أطفال',
    rating: 5,
    text: 'الألعاب التعليمية والصلصال الطبيعي هنا مميزة جداً ومطابقة للمعايير الصحية. أنصح كل أم تبحث عن ألعاب هادفة تبعد الأطفال عن الشاشات بمتجر عمران.',
    toy: 'مجموعة التجارب العلمية والمجهر'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-toy-red px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Heart className="w-4 h-4 fill-toy-red" />
            <span>آراء وتجارب عملاء عمران</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            فرحة أطفالكم هي سر نجاحنا ❤️
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            أكثر من 15,000 عائلة سعيدة تثق بألعاب متجر عمران
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-200" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-4">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t.name}</h4>
                  <span className="text-[11px] text-slate-400">{t.role}</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium max-w-[130px] truncate">
                  {t.toy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
