import React, { useState } from 'react';
import { Mail, Phone, MapPin, Heart, ArrowUp, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { activeCategories as categories } from '../../data/categories';

export default function Footer() {
  const { setSelectedCategory, setIsTrackingOpen, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
      return;
    }
    setSubscribed(true);
    showToast('شكراً لاشتراكك! هنوافيك بكل جديد أول بأول 🎁');
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
              كن أول من يعرف بأحدث الألعاب والعروض
            </h3>
            <p className="text-white/80 text-xs sm:text-sm">
              اشترك في نشرتنا لتصل إليك أحدث الألعاب الحصرية والعروض ومسابقات الأطفال أولاً بأول!
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
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-soft overflow-hidden">
                <img src="/brand/logo.png" alt="شعار شركة عمران التجارية" width="56" height="56" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">
                  عمران <span className="text-toy-yellow">للألعاب</span>
                </span>
                <span className="text-[11px] font-bold text-toy-yellow/90">شركة عمران التجارية • لعب أطفال ومستلزمات حفلات</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              شركة عمران التجارية هي وجهتكم الأولى في مصر لألعاب الأطفال ومستلزماتهم. نوفر تشكيلة مختارة، أسعارًا واضحة بالجنيه، وتوصيلًا سريعًا مع خدمة طلب مباشرة عبر WhatsApp.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
                🇪🇬 خدمة داخل مصر
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
                طلب مباشر عبر WhatsApp
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
                <a href="https://wa.me/201555570269" target="_blank" rel="noreferrer" dir="ltr" className="hover:text-toy-green transition-colors">+20 15 5555 70269</a>
              </div>
              <div className="pt-1">
                <span className="block text-sm font-bold text-white mb-2">فروعنا</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-toy-red shrink-0 mt-0.5" />
                    <span>طنطا — ميدان السيد البدوي</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-toy-red shrink-0 mt-0.5" />
                    <span>شارع درب الابشيهي</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-toy-red shrink-0 mt-0.5" />
                    <span>الاستاد أمام نادي سيتي كلوب و مطعم سي السيد</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Payment methods & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © 2026</span>
            <strong className="text-slate-300">متجر عمران للألعاب (مصر)</strong>
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
