import React, { useState } from 'react';
import { Mail, Phone, MapPin, Heart, ArrowUp, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categories } from '../../data/categories';

export default function Footer() {
  const { setSelectedCategory, setIsGiftFinderOpen, setIsTrackingOpen, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
      return;
    }
    setSubscribed(true);
    showToast('شكراً لاشتراكك! تم إرسال كود خصم 10% إلى بريدك الإلكتروني 🎁');
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 mt-16 border-t-4 border-toy-yellow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter Strip */}
        <div className="bg-gradient-to-r from-toy-red/90 via-toy-purple/90 to-toy-blue/90 p-6 sm:p-8 rounded-3xl mb-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right max-w-xl">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold inline-block mb-2">
              نادي أصدقاء عمران في مصر 🎈
            </span>
            <h3 className="text-xl sm:text-2xl font-black mb-1">
              احصل على خصم 10% فورياً عند اشتراكك بنشرتنا
            </h3>
            <p className="text-white/80 text-xs sm:text-sm">
              كن أول من يعرف عن وصول أحدث الألعاب الحصرية، وكوبونات الخصم بالجنيه المصري، ومسابقات الأطفال!
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني هنا..."
                className="w-full sm:w-72 px-4 py-3 rounded-2xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-sm transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>اشتراك الآن</span>
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-toy-red via-toy-yellow to-toy-purple flex items-center justify-center text-xl shadow">
                🧸
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                عمران <span className="text-toy-red">للألعاب</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              وجهتكم الأولى في مصر لأفضل ألعاب الأطفال التعليمية والترفيهية. نوفر منتجات أصلية، تغليف هدايا مجاني، وتوصيل سريع لكافة المحافظات بالجنيه المصري.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                سجل تجاري: 452189
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                بطاقة ضريبية: 849-210-534
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              أقسام الألعاب
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories.slice(1, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-toy-yellow transition-colors cursor-pointer text-right"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              خدمة العملاء
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="hover:text-toy-yellow transition-colors cursor-pointer"
                >
                  تتبع الشحنة والطلب
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsGiftFinderOpen(true)}
                  className="hover:text-toy-yellow transition-colors cursor-pointer"
                >
                  مساعد اختيار الهدايا
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-toy-yellow transition-colors">
                  الأسئلة الأكثر شيوعاً
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-toy-yellow transition-colors">
                  الشحن والمحافظات
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-toy-yellow transition-colors">
                  سياسة الاسترجاع والاستبدال
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              تواصل معنا
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-toy-green" />
                <span dir="ltr">+20 10 1234 5678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-toy-yellow" />
                <span>egypt@omrantoys.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-toy-red" />
                <span>جمهورية مصر العربية (طنطا - القاهرة)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Payment methods & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © 2026</span>
            <strong className="text-slate-300">متجر عمران للألعاب (مصر)</strong>
            <span>| التعامل بالجنيه المصري (ج.م)</span>
            <Heart className="w-3.5 h-3.5 text-toy-red fill-toy-red inline" />
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-1 rounded text-[10px] border border-emerald-700">
              ميزة Meeza 🇪🇬
            </span>
            <span className="bg-purple-950 text-purple-300 font-bold px-2 py-1 rounded text-[10px] border border-purple-700">
              إنستاباي InstaPay
            </span>
            <span className="bg-rose-950 text-rose-300 font-bold px-2 py-1 rounded text-[10px] border border-rose-700">
              فودافون كاش
            </span>
            <span className="bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded text-[10px] border border-slate-700">
              Visa / Mastercard
            </span>
            <span className="bg-amber-950 text-amber-300 font-bold px-2 py-1 rounded text-[10px] border border-amber-700">
              فاليو ValU
            </span>
            <span className="bg-slate-800 text-emerald-400 font-bold px-2 py-1 rounded text-[10px] border border-slate-700">
              الدفع عند الاستلام
            </span>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="العودة للأعلى"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
