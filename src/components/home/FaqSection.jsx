import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'كيف يعمل تغليف الهدايا المجاني؟',
    a: 'في متجر عمران، نوفر تغليف هدايا احترافي وفاخر مجاناً 100%! عند إتمام طلبك يمكنك تفعيل خيار تغليف الهدية وإضافة نص رسالة إهداء سنقوم بطباعتها على بطاقة أنيقة باسم الطفل وإرفاقها مع الهدية.'
  },
  {
    q: 'ما هي مدة وتكلفة التوصيل؟',
    a: 'التوصيل سريع للغاية: داخل مدينة الرياض يتم التوصيل خلال 24 ساعة، ولباقي مدن المملكة خلال 24 - 48 ساعة. التوصيل مجاني تماماً لجميع الطلبات بقيمة 250 ريال أو أكثر، ورسوم الشحن للطلبات الأقل هي 25 ريال فقط.'
  },
  {
    q: 'هل الألعاب مطابقة للمواصفات وآمنة للأطفال؟',
    a: 'نعم بكل تأكيد! جميع الألعاب والمنتجات المعروضة في متجر عمران معتمدة بشهادة المطابقة للمواصفات والمقاييس الخليجية SASO، ومصنوعة من مواد غير سامة وخالية تماماً من مادة البيسفينول (BPA) والرصاص.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة لديكم؟',
    a: 'نوفر جميع وسائل الدفع المريحة والآمنة: بطاقات مدى، البطاقات الائتمانية (فيزا وماستركارد)، Apple Pay، بالإضافة إلى خدمة التقسيط الميسر على 4 دفعات بدون فوائد عبر تمارا وتابي، والدفع عند الاستلام (COD).'
  },
  {
    q: 'ما هي سياسة الاسترجاع والاستبدال؟',
    a: 'يحق لعملائنا الكرام استبدال أو استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون في حالتها الأصلية وبتغليفها المصنعي. فريق خدمة العملاء متاح دائماً لخدمتكم وتسهيل الإجراءات.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-toy-blue px-3 py-1 rounded-full text-xs font-bold mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>مركز المساعدة والأسئلة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          الأسئلة الشائعة حول متجر عمران ❓
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          كل ما تحتاج معرفته عن الطلب، الشحن، تغليف الهدايا، وضمان الجودة
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
