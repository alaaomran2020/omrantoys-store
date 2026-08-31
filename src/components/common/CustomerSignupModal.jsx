import React, { useEffect, useState } from 'react';
import { X, User, Phone, Gift, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth, isValidEgyptianPhone } from '../../context/AuthContext';

// أيقونة فيسبوك (غير متوفرة في مكتبة الأيقونات الحالية)
const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
  </svg>
);

export default function CustomerSignupModal() {
  const { isSignupOpen, setIsSignupOpen, showToast, applyCouponCode, appliedCoupon } = useStore();
  const { customer, registerCustomer, updateCustomer } = useAuth();

  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(customer?.phone ? `0${customer.phone.slice(2)}` : '');
  const [facebook, setFacebook] = useState(customer?.facebook || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // فتح تلقائي لأول زيارة (بعد ثانيتين) طالما العميل غير مسجل
  useEffect(() => {
    if (customer) return;
    const seen = localStorage.getItem('omran_signup_seen');
    if (seen) return;
    const timer = setTimeout(() => {
      setIsSignupOpen(true);
      localStorage.setItem('omran_signup_seen', '1');
    }, 2000);
    return () => clearTimeout(timer);
  }, [customer, setIsSignupOpen]);

  useEffect(() => {
    if (!isSignupOpen) { setDone(false); setErrors({}); return; }
    setFullName(customer?.fullName || '');
    setPhone(customer?.phone ? `0${customer.phone.slice(2)}` : '');
    setFacebook(customer?.facebook || '');
  }, [isSignupOpen, customer]);

  if (!isSignupOpen) return null;

  const validate = () => {
    const next = {};
    if (fullName.trim().length < 3) next.fullName = 'من فضلك اكتب الاسم كامل (٣ أحرف على الأقل)';
    if (!isValidEgyptianPhone(phone)) next.phone = 'رقم موبايل مصري صحيح يبدأ بـ 01 ويتكون من 11 رقم';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (customer) {
        updateCustomer({ fullName: fullName.trim(), phone, facebook: facebook.trim() });
      } else {
        await registerCustomer({ fullName, phone, facebook });
      }
      setDone(true);
      if (!appliedCoupon) applyCouponCode('OMRAN10');
      showToast('تم تسجيل بياناتك 🎉 كود خصم 10% تم تفعيله على سلتك', 'success');
      setTimeout(() => setIsSignupOpen(false), 2200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-l from-toy-red via-pink-600 to-toy-purple p-5 text-white">
          <button
            onClick={() => setIsSignupOpen(false)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <img src="/brand/logo.png" alt="عمران للألعاب" width="56" height="56" className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg" />
            <h3 className="text-lg font-black">
              {done ? 'تم تسجيل بياناتك!' : 'أهلاً بك في عمران للألعاب'}
            </h3>
            <p className="text-xs text-white/85 leading-relaxed max-w-[15rem]">
              {done
                ? 'هنستخدم بياناتك لتأكيد طلبك وتوصيل أسرع'
                : 'سجّل اسمك ورقمك وبياناتك خلال ثوانٍ، وخد كود خصم 10% على أول طلب'}
            </p>
          </div>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <p className="text-sm font-black text-slate-900">كود الخصم: OMRAN10</p>
            <p className="text-xs text-slate-500 mt-1">هيظهر تلقائياً في خانة كوبون الخصم داخل السلة</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-toy-red" /> الاسم بالكامل *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد محمود"
                className={`w-full h-12 px-3.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20 focus:border-toy-red ${errors.fullName ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-toy-red" /> رقم الموبايل *
              </label>
              <input
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={`w-full h-12 px-3.5 bg-slate-50 border rounded-xl text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-toy-red/20 focus:border-toy-red ${errors.phone ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" /> حساب الفيسبوك *
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="facebook.com/اسمك  أو  اسم الحساب"
                className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20 focus:border-toy-red"
              />
              <p className="text-[11px] text-slate-400 mt-1">عشان نوصل لك بالعروض والمتابعة بسهولة</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-toy-red hover:bg-rose-600 disabled:opacity-60 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-toy-red/25 cursor-pointer active:scale-[0.98] transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              <span>سجّلني وخد خصم 10%</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              بياناتك مش هتستخدم غير في التواصل معاك بخصوص طلباتك وعروض عمران فقط.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
