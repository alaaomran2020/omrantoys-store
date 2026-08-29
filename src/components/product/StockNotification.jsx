import React, { useState } from 'react';
import { Bell, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

export default function StockNotification({ product, onClose }) {
  const [contact, setContact] = useState('');
  const [type, setType] = useState('email'); // email or phone
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contact.trim()) {
      setError('يرجى إدخال البريد أو رقم الهاتف');
      return;
    }
    if (type === 'email' && !contact.includes('@')) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }
    setLoading(true);
    try {
      // Save to localStorage mock - in production save to Supabase stock_notifications
      const existing = JSON.parse(localStorage.getItem('omran_stock_notifications') || '[]');
      existing.push({
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        email: type === 'email' ? contact : null,
        phone: type === 'phone' ? contact : null,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('omran_stock_notifications', JSON.stringify(existing));
      
      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err) {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h4 className="font-black text-sm text-emerald-900">تم تسجيل طلبك بنجاح!</h4>
        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">سنخطرك فور توفر <strong>{product.name}</strong> عبر {type === 'email' ? 'البريد' : 'الواتساب'}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-sm text-slate-900">أعلمني عند التوفر</h4>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            المنتج <strong>{product.name}</strong> نفد حالياً. اترك بياناتك وسنخطرك فور وصول كمية جديدة.
          </p>

          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setType('email')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${type === 'email' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                <Mail className="w-3.5 h-3.5" /> بريد
              </button>
              <button type="button" onClick={() => setType('phone')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${type === 'phone' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                <Phone className="w-3.5 h-3.5" /> واتساب
              </button>
            </div>

            <div className="relative">
              <input
                type={type === 'email' ? 'email' : 'tel'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={type === 'email' ? 'example@mail.com' : '01XXXXXXXXX'}
                className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-left"
                dir={type === 'email' ? 'ltr' : 'ltr'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
              {loading ? 'جاري التسجيل...' : (
                <>
                  <Bell className="w-4 h-4" />
                  أعلمني عند التوفر
                </>
              )}
            </button>
          </form>

          <div className="mt-3 text-[10px] text-slate-400 text-center">🔒 بياناتك آمنة ولن نشاركها - إشعار مرة واحدة فقط</div>
        </div>
      </div>
    </div>
  );
}
