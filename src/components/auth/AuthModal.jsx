import React, { useState } from 'react';
import { X, User, Store, Mail, Lock, Phone, MapPin, Building, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useStore();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // signin, signup, wholesale
  const [userType, setUserType] = useState('retail');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    businessName: '',
    governorate: 'طنطا (الغربية)',
    city: '',
    taxId: '',
  });

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (mode === 'signin') {
        const res = await signIn({ email: form.email, password: form.password });
        if (res.success) {
          setMessage({ type: 'success', text: 'تم تسجيل الدخول بنجاح! مرحباً بك 👋' });
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        } else {
          setMessage({ type: 'error', text: res.error || 'فشل تسجيل الدخول، تأكد من البيانات' });
        }
      } else {
        if (!form.fullName.trim() || !form.phone.trim()) {
          setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة' });
          setLoading(false);
          return;
        }
        const res = await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          userType,
          businessName: form.businessName,
          governorate: form.governorate,
        });
        if (res.success) {
          setMessage({ 
            type: 'success', 
            text: userType === 'wholesale' 
              ? 'تم إنشاء حساب التاجر! سيتم مراجعته وتفعيل أسعار الجملة خلال 24 ساعة.' 
              : 'تم إنشاء الحساب بنجاح! مرحباً بك في عائلة عمران 🎉' 
          });
          setTimeout(() => setIsAuthModalOpen(false), 2000);
        } else {
          setMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء إنشاء الحساب' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-toy-red p-6 text-white">
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              {userType === 'wholesale' ? <Store className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black">{mode === 'signin' ? 'تسجيل الدخول' : userType === 'wholesale' ? 'حساب تاجر جملة' : 'إنشاء حساب جديد'}</h2>
              <p className="text-xs text-white/70 mt-0.5">{userType === 'wholesale' ? 'أسعار جملة • شحن مجاني • دعم مخصص' : 'تسوق بأسعار القطاعي مع عروض حصرية'}</p>
            </div>
          </div>

          {/* User Type Toggle for Signup */}
          {mode !== 'signin' && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setUserType('retail')} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${userType === 'retail' ? 'bg-white text-slate-900 border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/15'}`}>
                <User className="w-4 h-4 mx-auto mb-1" />
                عميل قطاعي
              </button>
              <button type="button" onClick={() => setUserType('wholesale')} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${userType === 'wholesale' ? 'bg-amber-400 text-slate-900 border-amber-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/15'}`}>
                <Store className="w-4 h-4 mx-auto mb-1" />
                تاجر جملة
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {mode !== 'signin' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل *</label>
                <div className="relative">
                  <input type="text" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="مثال: أحمد محمد" className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20" required />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الموبايل *</label>
                  <div className="relative">
                    <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20 text-left" dir="ltr" required />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المحافظة</label>
                  <div className="relative">
                    <select value={form.governorate} onChange={(e) => setForm(f => ({ ...f, governorate: e.target.value }))} className="w-full pr-8 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-toy-red/20 cursor-pointer">
                      <option>طنطا (الغربية)</option>
                      <option>القاهرة</option>
                      <option>الجيزة</option>
                      <option>الإسكندرية</option>
                      <option>المنصورة (الدقهلية)</option>
                      <option>الزقازيق (الشرقية)</option>
                      <option>المنيا</option>
                      <option>أسيوط</option>
                    </select>
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {userType === 'wholesale' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900"><Building className="w-4 h-4" /> بيانات النشاط التجاري</div>
                  <input type="text" value={form.businessName} onChange={(e) => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="اسم المحل أو الشركة *" className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" required={userType === 'wholesale'} />
                  <div className="text-[11px] text-amber-800 leading-relaxed">
                    ✓ أسعار جملة مخفضة حتى 25%<br />
                    ✓ حد أدنى للطلب 5 قطع<br />
                    ✓ شحن مجاني للطلبات فوق 800 ج.م<br />
                    ✓ دعم مخصص عبر واتساب
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني *</label>
            <div className="relative">
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@mail.com" className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20" required />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {mode === 'signin' && <p className="text-[11px] text-slate-400 mt-1">للتجربة: retail@test.com أو wholesale@test.com مع أي كلمة سر</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-toy-red/20" required />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-toy-red disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.01]">
            {loading ? 'جاري المعالجة...' : mode === 'signin' ? 'تسجيل الدخول' : userType === 'wholesale' ? 'إنشاء حساب تاجر' : 'إنشاء حساب'}
            <Sparkles className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-xs font-bold text-toy-red hover:underline cursor-pointer">
              {mode === 'signin' ? 'ليس لديك حساب؟ أنشئ حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            بالتسجيل أنت توافق على <span className="font-bold text-slate-600">شروط الاستخدام</span> و<span className="font-bold text-slate-600">سياسة الخصوصية</span> لشركة عمران التجارية
          </div>
        </form>
      </div>
    </div>
  );
}
