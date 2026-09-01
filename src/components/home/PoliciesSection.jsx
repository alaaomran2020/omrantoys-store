import { CheckCircle2, MessageCircle, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';

const policies = [
  {
    icon: Truck,
    title: 'الشحن داخل مصر',
    text: 'توصيل منظم إلى جميع المحافظات، مع إظهار المدة والتكلفة قبل تأكيد الطلب عبر WhatsApp.',
    color: 'text-toy-blue bg-cyan-50'
  },
  {
    icon: RefreshCcw,
    title: 'الاستبدال والاسترجاع',
    text: 'تواصل معنا خلال 14 يومًا من الاستلام، مع الاحتفاظ بالمنتج وتغليفه الأصلي.',
    color: 'text-toy-red bg-rose-50'
  },
  {
    icon: ShieldCheck,
    title: 'اختيار آمن للعائلة',
    text: 'معلومات العمر والخامة والاستخدام موضحة لكل منتج لمساعدتك على الاختيار بثقة.',
    color: 'text-emerald-700 bg-emerald-50'
  },
  {
    icon: MessageCircle,
    title: 'تأكيد قبل التجهيز',
    text: 'نراجع معك التوفر والعنوان وطريقة الدفع على واتساب قبل تجهيز الشحنة.',
    color: 'text-amber-700 bg-amber-50'
  }
];

export default function PoliciesSection() {
  return (
    <section id="shipping" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-[2rem] bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 p-6 sm:p-8 lg:p-10 items-center">
          <div className="text-right">
            <span className="inline-flex items-center gap-2 rounded-full bg-toy-yellow/15 px-3 py-1 text-xs font-black text-amber-800">
              <CheckCircle2 className="w-4 h-4" /> تجربة شراء واضحة ومطمئنة
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              كل طلب يبدأ بمحادثة سهلة مع فريق عمران
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              اختر ألعابك من الكتالوج، أضفها إلى السلة، ثم أرسل ملخص الطلب إلى WhatsApp. سيؤكد معك فريق شركة عمران التجارية التوفر، العنوان، الشحن، وطريقة الدفع قبل التجهيز.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/201555570269?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20الم%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%81%D9%8A%20اختيار%20ل%D8%B9%D8%A8%D8%A9"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow-lg shadow-green-500/20 transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" /> تواصل عبر WhatsApp
              </a>
              <a href="#faq" className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">
                اقرأ الأسئلة الشائعة
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {policies.map(({ icon: Icon, title, text, color }) => (
              <article id={title === 'الاستبدال والاسترجاع' ? 'returns' : undefined} key={title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-right">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
