import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'ما هي مدة وتكلفة التوصيل داخل مصر؟',
    a: 'التوصيل سريع للغاية: داخل طنطا والقاهرة والجيزة والإسكندرية يتم التوصيل خلال 24 - 48 ساعة، ولباقي المحافظات خلال يومين إلى 3 أيام عمل. التوصيل مجاني تماماً لجميع الطلبات بقيمة 1,000 جنيه أو أكثر، ورسوم الشحن العادية هي 50 جنيه فقط.'
  },
  {
    q: 'هل جميع الأسعار بالجنيه المصري؟',
    a: 'نعم، جميع الأسعار والتعاملات في متجر عمران بالجنيه المصري (ج.م) وشاملة ضريبة القيمة المضافة، ولا توجد أي رسوم أو عملات إضافية خفية.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة بالجنيه المصري؟',
    a: 'نوفر جميع وسائل الدفع المريحة داخل جمهورية مصر العربية: إنستاباي ومحافظ الموبايل (فودافون كاش، أورنج كاش، اتصالات كاش، وي باي)، كارت ميزة والبطاقات البنكية (فيزا وماستركارد)، الدفع عند الاستلام نقداً للمندوب، وإمكانية التقسيط عبر فاليو (ValU) وأمان.'
  },
  {
    q: 'هل الألعاب مطابقة للمواصفات وآمنة للأطفال؟',
    a: 'نعم بكل تأكيد! جميع الألعاب والمنتجات المعروضة في متجر عمران خاضعة لمعايير السلامة والجودة ومصنوعة من خامات غير سامة وخالية تماماً من مادة البيسفينول (BPA) والرصاص.'
  },
  {
    q: 'ما هي سياسة الاسترجاع والاستبدال؟',
    a: 'يحق لعملائنا الكرام استبدال أو استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام طبقاً لقانون حماية المستهلك المصري، بشرط أن تكون اللعبة بحالتها وتغليفها الأصلي.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-toy-blue px-3 py-1 rounded-full text-xs font-bold mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>مركز المساعدة والأسئلة الشائعة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          الأسئلة الشائعة حول متجر عمران ❓
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          كل ما تحتاج معرفته عن الأسعار بالجنيه المصري، الشحن، والدفع
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'bg-white border-toy-blue shadow-sm' : 'bg-slate-50 border-slate-200/80 hover:bg-white'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-toy-blue' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
